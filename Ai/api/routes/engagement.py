from flask import Blueprint, request, jsonify
from predict import predict_likes, predict_engagement_category
from logger import logger
from utils import transform_input_features

engagement_bp = Blueprint('engagement', __name__)

@engagement_bp.route('/predict/engagement', methods=['POST'])
def predict_engagement():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        transformed_input = transform_input_features(data)
        predicted_likes = predict_likes(transformed_input)
        # Convert to integer
        predicted_likes = max(0, int(float(predicted_likes)))
        predicted_comments = max(0, int(predicted_likes * 0.1 + (predicted_likes * 0.02)))
        engagement_category = predict_engagement_category(float(predicted_likes))  # Pass as float for category calculation
        engagement_score = int((predicted_likes + predicted_comments * 2) / 10)
        logger.info(f"Prediction successful: {predicted_likes} likes, {predicted_comments} comments")
        return jsonify({
            "predicted_likes": predicted_likes,
            "predicted_comments": predicted_comments,
            "engagement_score": engagement_score,
            "engagement_category": engagement_category,
            "status": "success"
        })
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500 