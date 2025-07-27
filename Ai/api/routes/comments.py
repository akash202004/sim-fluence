from flask import Blueprint, request, jsonify
from combined_predict import predict_engagement as combined_predict_engagement
from logger import logger
from utils import transform_input_features

comments_bp = Blueprint('comments', __name__)

@comments_bp.route('/predict/comments', methods=['POST'])
def predict_comments_endpoint():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        # Use combined model for better predictions
        result = combined_predict_engagement(data)
        
        if result is None:
            return jsonify({"error": "Model loading failed"}), 500
            
        predicted_comments = result['predicted_comments']
        logger.info(f"Combined comments prediction successful: {predicted_comments} comments")
        return jsonify({
            "predicted_comments": predicted_comments,
            "model_info": result['model_info'],
            "status": "success"
        })
    except Exception as e:
        logger.error(f"Comments prediction error: {str(e)}")
        return jsonify({"error": f"Comments prediction failed: {str(e)}"}), 500 