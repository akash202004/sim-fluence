import sys
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from sentiment_analyzer import analyze_sentiment
from caption_generator import generate_caption
from predict import predict_likes, predict_comments, predict_shares
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime
from routes.engagement import engagement_bp
from routes.comments import comments_bp
from routes.shares import shares_bp
from routes.sentiment import sentiment_bp
from routes.caption import caption_bp
from routes.optimize import optimize_bp
from utils import transform_input_features, generate_optimization_recommendations
from logger import logger


# LangChain integration (optional - graceful fallback if not available)
try:
    from langchain_integration import GeminiXGBoostOptimizer, SimFluenceLangChainAgent
    LANGCHAIN_AVAILABLE = True
    logger.info("LangChain integration loaded successfully")
except ImportError as e:
    LANGCHAIN_AVAILABLE = False
    logger.warning(f"LangChain integration not available: {str(e)}")

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

app.register_blueprint(engagement_bp)
app.register_blueprint(comments_bp)
app.register_blueprint(shares_bp)
app.register_blueprint(sentiment_bp)
app.register_blueprint(caption_bp)
app.register_blueprint(optimize_bp)


@app.route('/', methods=['GET'])
def root():
    """Root endpoint - API documentation"""
    return jsonify({
        "service": "Sim-Fluence AI API",
        "version": "1.0.0",
        "description": "AI-powered content optimization and analysis API",
        "endpoints": {
            "health": "/health",
            "ai": {
                "gemini_optimize": "/ai/gemini/optimize",
                "gemini_caption": "/ai/gemini/caption",
                "comprehensive": "/ai/comprehensive",
                "models_status": "/ai/models/status"
            }
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "sim-fluence-ai-api",
        "version": "1.0.0"
    })


# LangChain + Gemini Integration Endpoints


@app.route('/ai/gemini/optimize', methods=['POST'])
def gemini_optimize_content():
    """
    Advanced content optimization using Gemini + XGBoost

    Expected input:
    {
        "content": "Your post content here",
        "user_profile": {
            "karma": 4500,
            "followers": 1200,
            "account_age_days": 700
        },
        "optimization_goals": ["engagement", "authenticity", "discussion"]
    }
    """
    if not LANGCHAIN_AVAILABLE:
        return jsonify({
            "error": "LangChain integration not available. Please install required packages.",
            "fallback_available": True,
            "status": "error"
        }), 503

    try:
        data = request.get_json()

        if not data or 'content' not in data:
            return jsonify({"error": "Content is required"}), 400

        content = data['content']
        user_profile = data.get('user_profile', {})
        optimization_goals = data.get('optimization_goals', ['engagement'])

        # Initialize Gemini optimizer
        google_api_key = os.getenv('GOOGLE_API_KEY')
        if not google_api_key:
            return jsonify({
                "error": "Google API key not configured",
                "status": "error"
            }), 500

        optimizer = GeminiXGBoostOptimizer(google_api_key)

        # Perform optimization
        result = optimizer.quick_optimize(
            content=content,
            user_karma=user_profile.get('karma', 1000),
            user_followers=user_profile.get('followers', 100)
        )

        logger.info(
            f"Gemini optimization completed for content: {content[:50]}...")

        return jsonify({
            "optimization_result": result,
            "ai_engine": "gemini_plus_xgboost",
            "status": "success"
        })

    except Exception as e:
        logger.error(f"Gemini optimization error: {str(e)}")
        return jsonify({
            "error": f"Gemini optimization failed: {str(e)}",
            "status": "error"
        }), 500


@app.route('/ai/gemini/caption', methods=['POST'])
def gemini_generate_caption():
    """
    Advanced caption generation using Gemini with context

    Expected input:
    {
        "prompt": "Description of content",
        "platform": "reddit",
        "engagement_target": "high",
        "context": {
            "user_data": {...},
            "additional_context": "..."
        }
    }
    """
    if not LANGCHAIN_AVAILABLE:
        return jsonify({
            "error": "LangChain integration not available",
            "status": "error"
        }), 503

    try:
        data = request.get_json()

        if not data or 'prompt' not in data:
            return jsonify({"error": "Prompt is required"}), 400

        prompt = data['prompt']
        platform = data.get('platform', 'reddit')
        engagement_target = data.get('engagement_target', 'medium')
        context = data.get('context', {})

        # Initialize Gemini optimizer
        google_api_key = os.getenv('GOOGLE_API_KEY')
        if not google_api_key:
            return jsonify({
                "error": "Google API key not configured",
                "status": "error"
            }), 500

        optimizer = GeminiXGBoostOptimizer(google_api_key)

        # Generate caption with context
        result = optimizer.smart_caption_generation(
            prompt=prompt,
            engagement_target=engagement_target
        )

        logger.info(f"Gemini caption generated for: {prompt[:50]}...")

        return jsonify({
            "caption_result": result,
            "ai_engine": "gemini_contextual",
            "platform": platform,
            "status": "success"
        })

    except Exception as e:
        logger.error(f"Gemini caption generation error: {str(e)}")
        return jsonify({
            "error": f"Gemini caption generation failed: {str(e)}",
            "status": "error"
        }), 500


@app.route('/ai/comprehensive', methods=['POST'])
def comprehensive_ai_analysis():
    """
    Complete AI analysis using LangChain agent with multiple tools

    Expected input:
    {
        "content": "Your content here",
        "user_data": {
            "karma": 4500,
            "followers": 1200,
            "account_age_days": 700
        },
        "analysis_depth": "full" // or "quick"
    }
    """
    if not LANGCHAIN_AVAILABLE:
        return jsonify({
            "error": "LangChain integration not available",
            "status": "error"
        }), 503

    try:
        data = request.get_json()

        if not data or 'content' not in data:
            return jsonify({"error": "Content is required"}), 400

        content = data['content']
        user_data = data.get('user_data', {})
        analysis_depth = data.get('analysis_depth', 'full')

        # Initialize LangChain agent
        google_api_key = os.getenv('GOOGLE_API_KEY')
        if not google_api_key:
            return jsonify({
                "error": "Google API key not configured",
                "status": "error"
            }), 500

        agent = SimFluenceLangChainAgent(google_api_key)

        if analysis_depth == 'quick':
            # Quick optimization
            optimizer = GeminiXGBoostOptimizer(google_api_key)
            result = optimizer.predict_and_optimize(content, user_data)
        else:
            # Full comprehensive analysis
            result = agent.comprehensive_analysis(content, user_data)

        logger.info(
            f"Comprehensive AI analysis completed for: {content[:50]}...")

        return jsonify({
            "analysis_result": result,
            "analysis_depth": analysis_depth,
            "ai_engine": "langchain_agent_gemini_xgboost",
            "status": "success"
        })

    except Exception as e:
        logger.error(f"Comprehensive AI analysis error: {str(e)}")
        return jsonify({
            "error": f"Comprehensive analysis failed: {str(e)}",
            "status": "error"
        }), 500


@app.route('/ai/models/status', methods=['GET'])
def ai_models_status():
    """Get status of all AI models and integrations"""
    try:
        status = {
            "xgboost_model": {
                "available": True,
                "model_path": "models/likes_predictor.pkl",
                "status": "ready"
            },
            "langchain_integration": {
                "available": LANGCHAIN_AVAILABLE,
                "status": "ready" if LANGCHAIN_AVAILABLE else "unavailable"
            },
            "gemini_api": {
                "configured": bool(os.getenv('GOOGLE_API_KEY')),
                "status": "ready" if os.getenv('GOOGLE_API_KEY') else "not_configured"
            }
        }

        return jsonify({
            "models_status": status,
            "overall_status": "ready" if all(
                model["status"] in ["ready", "not_configured"]
                for model in status.values()
            ) else "partial",
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({
            "error": f"Status check failed: {str(e)}",
            "status": "error"
        }), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
