from flask import Blueprint, request, jsonify
from caption_generator import generate_caption
from sentiment_analyzer import analyze_sentiment
from logger import logger
from utils import transform_input_features, generate_optimization_recommendations

optimize_bp = Blueprint('optimize', __name__)

@optimize_bp.route('/optimize/post', methods=['POST'])
def optimize_post():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        content = data.get('content', '')
        user_data = data.get('user_data', {})
        post_settings = data.get('post_settings', {})
        goals = data.get('optimization_goals', ['engagement'])
        results = {}
        if 'caption' in goals and content:
            caption_result = generate_caption(
                prompt=content,
                platform='reddit',
                tone='engaging'
            )
            results['optimized_caption'] = caption_result
        if 'sentiment' in goals and content:
            sentiment_result = analyze_sentiment(content)
            results['sentiment_analysis'] = sentiment_result
        if 'engagement' in goals:
            engagement_input = {
                "length": len(content),
                "containsImage": 1 if post_settings.get('containsImage') else 0,
                "userFollowers": user_data.get('userFollowers', 0),
                "userKarma": user_data.get('userKarma', 0),
                "accountAgeDays": user_data.get('accountAgeDays', 365),
                "avgEngagementRate": user_data.get('avgEngagementRate', 0.05),
                "avgLikes": user_data.get('avgLikes', 10),
                "avgComments": user_data.get('avgComments', 2),
                "dayOfWeek": post_settings.get('dayOfWeek', 'Friday'),
                "postTimeOfDay": post_settings.get('postTimeOfDay', 'Evening'),
                "topCommentSentiment": "Positive"
            }
            # Use combined model for better predictions
            from combined_predict import predict_engagement as combined_predict_engagement
            result = combined_predict_engagement(engagement_input)
            
            if result is not None:
                predicted_likes = result['predicted_likes']
                predicted_comments = result['predicted_comments']
                predicted_shares = result['predicted_shares']
                results['engagement_prediction'] = {
                    "predicted_likes": predicted_likes,
                    "predicted_comments": predicted_comments,
                    "predicted_shares": predicted_shares,
                    "engagement_score": round((predicted_likes + predicted_comments * 2 + predicted_shares * 3) / 10, 2),
                    "model_info": result['model_info']
                }
            else:
                # Fallback to basic prediction
                transformed_input = transform_input_features(engagement_input)
                from predict import predict_likes
                predicted_likes = predict_likes(transformed_input)
                predicted_comments = max(0, int(predicted_likes * 0.1))
                results['engagement_prediction'] = {
                    "predicted_likes": predicted_likes,
                    "predicted_comments": predicted_comments,
                    "engagement_score": round((predicted_likes + predicted_comments * 2) / 10, 2)
                }
        results['recommendations'] = generate_optimization_recommendations(results)
        return jsonify({
            "results": results,
            "status": "success"
        })
    except Exception as e:
        logger.error(f"Post optimization error: {str(e)}")
        return jsonify({"error": f"Post optimization failed: {str(e)}"}), 500 