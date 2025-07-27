from flask import Blueprint, request, jsonify
from predict import predict_comments
from logger import logger
from utils import transform_input_features

comments_bp = Blueprint('comments', __name__)

@comments_bp.route('/predict/comments', methods=['POST'])
def predict_comments_endpoint():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        transformed_input = transform_input_features(data)
        predicted_comments = predict_comments(transformed_input)
        # Convert to integer
        predicted_comments = max(0, int(float(predicted_comments)))
        logger.info(f"Comments prediction successful: {predicted_comments} comments")
        return jsonify({
            "predicted_comments": predicted_comments,
            "status": "success"
        })
    except Exception as e:
        logger.error(f"Comments prediction error: {str(e)}")
        return jsonify({"error": f"Comments prediction failed: {str(e)}"}), 500 