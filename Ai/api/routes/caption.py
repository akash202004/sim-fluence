from flask import Blueprint, request, jsonify
from caption_generator import generate_caption
from logger import logger

caption_bp = Blueprint('caption', __name__)

@caption_bp.route('/generate/caption', methods=['POST'])
def generate_post_caption():
    try:
        data = request.get_json()
        if not data or 'prompt' not in data:
            return jsonify({"error": "Prompt is required"}), 400
        caption_result = generate_caption(
            prompt=data['prompt'],
            platform=data.get('platform', 'reddit'),
            tone=data.get('tone', 'casual'),
            length=data.get('length', 'medium'),
            include_hashtags=data.get('include_hashtags', False),
            target_audience=data.get('target_audience', 'general')
        )
        logger.info(f"Caption generated successfully for prompt: {data['prompt'][:50]}...")
        return jsonify({
            "caption": caption_result['caption'],
            "hashtags": caption_result.get('hashtags', []),
            "confidence": caption_result.get('confidence', 0.8),
            "suggestions": caption_result.get('suggestions', []),
            "status": "success"
        })
    except Exception as e:
        logger.error(f"Caption generation error: {str(e)}")
        return jsonify({"error": f"Caption generation failed: {str(e)}"}), 500 