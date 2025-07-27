from flask import Blueprint, request, jsonify
from predict import predict_shares
from logger import logger
from utils import transform_input_features

shares_bp = Blueprint('shares', __name__)

@shares_bp.route('/predict/shares', methods=['POST'])
def predict_shares_endpoint():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        transformed_input = transform_input_features(data)
        predicted_shares = predict_shares(transformed_input)
        # Convert numpy float32 to integer
        predicted_shares = max(0, int(float(predicted_shares)))
        logger.info(f"Shares prediction successful: {predicted_shares} shares")
        return jsonify({
            "predicted_shares": predicted_shares,
            "status": "success"
        })
    except Exception as e:
        logger.error(f"Shares prediction error: {str(e)}")
        return jsonify({"error": f"Shares prediction failed: {str(e)}"}), 500 