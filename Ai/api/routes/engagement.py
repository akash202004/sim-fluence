from flask import Blueprint, request, jsonify
from combined_predict import predict_engagement as combined_predict_engagement
from logger import logger
from utils import transform_input_features

engagement_bp = Blueprint('engagement', __name__)

@engagement_bp.route('/predict/engagement', methods=['POST'])
def predict_engagement():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        # Use combined model for better predictions
        result = combined_predict_engagement(data)
        
        if result is None:
            return jsonify({"error": "Model loading failed"}), 500
            
        predicted_likes = result['predicted_likes']
        predicted_comments = result['predicted_comments']
        predicted_shares = result['predicted_shares']
        
        # Calculate engagement category and score
        engagement_category = "low" if predicted_likes < 10 else "medium" if predicted_likes < 50 else "high" if predicted_likes < 200 else "viral"
        engagement_score = int((predicted_likes + predicted_comments * 2 + predicted_shares * 3) / 10)
        
        logger.info(f"Combined prediction successful: {predicted_likes} likes, {predicted_comments} comments, {predicted_shares} shares")
        return jsonify({
            "predicted_likes": predicted_likes,
            "predicted_comments": predicted_comments,
            "predicted_shares": predicted_shares,
            "engagement_score": engagement_score,
            "engagement_category": engagement_category,
            "model_info": result['model_info'],
            "status": "success"
        })
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500 