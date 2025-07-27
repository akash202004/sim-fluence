from flask import Blueprint, request, jsonify
from sentiment_analyzer import analyze_sentiment
from logger import logger

sentiment_bp = Blueprint('sentiment', __name__)

@sentiment_bp.route('/analyze/sentiment', methods=['POST'])
def analyze_text_sentiment():
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "Text is required"}), 400
        sentiment_result = analyze_sentiment(data['text'])
        return jsonify({
            "sentiment": sentiment_result['sentiment'],
            "confidence": sentiment_result['confidence'],
            "scores": sentiment_result['scores'],
            "status": "success"
        })
    except Exception as e:
        logger.error(f"Sentiment analysis error: {str(e)}")
        return jsonify({"error": f"Sentiment analysis failed: {str(e)}"}), 500 