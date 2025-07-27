from flask import Blueprint, request, jsonify
import sys
import os

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from time_predict import predict_optimal_time, format_time_prediction

time_bp = Blueprint('time', __name__)

@time_bp.route('/predict/optimal-time', methods=['POST'])
def predict_time():
    """
    Predict optimal posting time for a given subreddit and content
    
    Expected input:
    {
        "subreddit": "funny",
        "content_type": "image",
        "user_data": {
            "title_length": 50,
            "has_image": true
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "error": "No data provided",
                "status": "error"
            }), 400
        
        # Extract parameters
        subreddit = data.get('subreddit', 'funny')
        content_type = data.get('content_type', 'text')
        user_data = data.get('user_data', {})
        
        # Validate subreddit
        if not subreddit or not isinstance(subreddit, str):
            return jsonify({
                "error": "Invalid subreddit name",
                "status": "error"
            }), 400
        
        # Validate content type
        valid_content_types = ['text', 'image', 'video', 'link']
        if content_type not in valid_content_types:
            return jsonify({
                "error": f"Invalid content_type. Must be one of: {valid_content_types}",
                "status": "error"
            }), 400
        
        # Get prediction
        prediction = predict_optimal_time(subreddit, content_type, user_data)
        
        # Format response
        formatted_prediction = format_time_prediction(prediction)
        
        return jsonify(formatted_prediction)
        
    except Exception as e:
        return jsonify({
            "error": f"Time prediction failed: {str(e)}",
            "status": "error"
        }), 500

@time_bp.route('/predict/time-engagement', methods=['POST'])
def predict_time_engagement():
    """
    Predict engagement for different posting times
    
    Expected input:
    {
        "subreddit": "funny",
        "content_type": "image",
        "hours": [9, 12, 15, 18, 21]
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "error": "No data provided",
                "status": "error"
            }), 400
        
        subreddit = data.get('subreddit', 'funny')
        content_type = data.get('content_type', 'text')
        hours = data.get('hours', [9, 12, 15, 18, 21])
        
        # Get predictions for multiple hours
        predictions = []
        for hour in hours:
            user_data = {'hour': hour}
            prediction = predict_optimal_time(subreddit, content_type, user_data)
            predictions.append({
                "hour": hour,
                "time_slot": prediction.get('optimal_time_slot', 'Unknown'),
                "confidence": prediction.get('confidence', 0.5)
            })
        
        return jsonify({
            "subreddit": subreddit,
            "content_type": content_type,
            "hourly_predictions": predictions,
            "status": "success"
        })
        
    except Exception as e:
        return jsonify({
            "error": f"Time engagement prediction failed: {str(e)}",
            "status": "error"
        }), 500

@time_bp.route('/time/status', methods=['GET'])
def time_status():
    """Check status of time prediction models"""
    try:
        # Try to load the model to check if it's available
        from time_predict import load_time_prediction_model
        engine = load_time_prediction_model()
        
        if engine and engine.global_model:
            return jsonify({
                "status": "available",
                "models_loaded": True,
                "global_model": True,
                "subreddit_models": len(engine.subreddit_models),
                "content_models": len(engine.content_type_models)
            })
        else:
            return jsonify({
                "status": "not_available",
                "models_loaded": False,
                "message": "Time prediction models not trained yet"
            })
            
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500 