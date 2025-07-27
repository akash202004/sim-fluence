from flask import Blueprint, request, jsonify
from combined_predict import predict_engagement as combined_predict_engagement
from logger import logger
from utils import transform_input_features

shares_bp = Blueprint('shares', __name__)

@shares_bp.route('/predict/shares', methods=['POST'])
def predict_shares_endpoint():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        # Use combined model for better predictions
        result = combined_predict_engagement(data)
        
        if result is None:
            return jsonify({"error": "Model loading failed"}), 500
            
        predicted_shares = result['predicted_shares']
        logger.info(f"Combined shares prediction successful: {predicted_shares} shares")
        return jsonify({
            "predicted_shares": predicted_shares,
            "model_info": result['model_info'],
            "status": "success"
        })
    except Exception as e:
        logger.error(f"Shares prediction error: {str(e)}")
        return jsonify({"error": f"Shares prediction failed: {str(e)}"}), 500 