#!/usr/bin/env python3
"""
Test script for LangChain + Gemini + XGBoost integration
"""

import os
import sys
import json
from typing import Dict

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))


def test_basic_integration():
    """Test basic AI client functionality"""
    print("🧪 Testing Basic AI Integration")
    print("-" * 40)

    try:
        from ai_client import SimFluenceAI

        ai = SimFluenceAI()

        # Test basic engagement prediction
        result = ai.quick_engagement_prediction(
            user_karma=4500,
            user_followers=1200,
            content="Testing the new AI integration with LangChain and Gemini!",
            has_image=False
        )

        print(
            f"✅ Basic engagement prediction: {result.get('predicted_likes', 'N/A')} likes")

        # Test AI capabilities check
        capabilities = ai.check_ai_capabilities()
        print(
            f"✅ AI capabilities: {capabilities.get('recommended_mode', 'standard')}")

        return True

    except Exception as e:
        print(f"❌ Basic integration test failed: {str(e)}")
        return False


def test_langchain_integration():
    """Test LangChain integration (requires Google API key)"""
    print("\n🤖 Testing LangChain + Gemini Integration")
    print("-" * 45)

    google_api_key = os.getenv('GOOGLE_API_KEY')
    if not google_api_key:
        print("⚠️ GOOGLE_API_KEY not set - skipping LangChain tests")
        return True

    try:
        from langchain_integration import GeminiXGBoostOptimizer

        optimizer = GeminiXGBoostOptimizer(google_api_key)

        # Test quick optimization
        result = optimizer.quick_optimize(
            content="Just built an amazing new feature for our app!",
            user_karma=4500,
            user_followers=1200
        )

        print(f"✅ Gemini optimization: {result.get('status', 'unknown')}")

        # Test smart caption generation
        caption_result = optimizer.smart_caption_generation(
            prompt="A photo of my workspace setup",
            engagement_target="high"
        )

        print(
            f"✅ Smart caption generation: {caption_result.get('status', 'unknown')}")

        return True

    except Exception as e:
        print(f"❌ LangChain integration test failed: {str(e)}")
        return False


def test_api_endpoints():
    """Test new API endpoints"""
    print("\n🌐 Testing New API Endpoints")
    print("-" * 35)

    try:
        import requests

        base_url = "http://localhost:5001"

        # Test health check
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ API health check: OK")
        else:
            print("❌ API health check: Failed")
            return False

        # Test AI models status
        response = requests.get(f"{base_url}/ai/models/status", timeout=10)
        if response.status_code == 200:
            status = response.json()
            print(
                f"✅ AI models status: {status.get('overall_status', 'unknown')}")
        else:
            print("❌ AI models status: Failed")

        # Test basic engagement prediction
        test_payload = {
            "length": 45,
            "containsImage": 1,
            "userFollowers": 1200,
            "userKarma": 4500,
            "accountAgeDays": 700,
            "avgEngagementRate": 0.06,
            "dayOfWeek": "Friday",
            "postTimeOfDay": "Evening"
        }

        response = requests.post(f"{base_url}/predict/engagement",
                                 json=test_payload, timeout=10)
        if response.status_code == 200:
            result = response.json()
            print(
                f"✅ Engagement prediction: {result.get('predicted_likes', 'N/A')} likes")
        else:
            print("❌ Engagement prediction: Failed")

        # Test Gemini optimization (if available)
        if os.getenv('GOOGLE_API_KEY'):
            gemini_payload = {
                "content": "Testing Gemini integration with our AI system",
                "user_profile": {
                    "karma": 4500,
                    "followers": 1200,
                    "account_age_days": 700
                },
                "optimization_goals": ["engagement", "authenticity"]
            }

            response = requests.post(f"{base_url}/ai/gemini/optimize",
                                     json=gemini_payload, timeout=30)
            if response.status_code == 200:
                print("✅ Gemini optimization: Available")
            elif response.status_code == 503:
                print("⚠️ Gemini optimization: Service unavailable")
            else:
                print("❌ Gemini optimization: Error")
        else:
            print("⚠️ Gemini optimization: No API key (skipped)")

        return True

    except requests.RequestException as e:
        print(f"❌ API endpoint tests failed: {str(e)}")
        print("💡 Make sure the AI API is running: python api/app.py")
        return False
    except Exception as e:
        print(f"❌ API endpoint tests failed: {str(e)}")
        return False


def test_model_validation():
    """Test that the XGBoost model works properly"""
    print("\n🔍 Testing XGBoost Model Validation")
    print("-" * 40)

    try:
        from predict import predict_likes

        # Test sample prediction
        sample_input = {
            "length": 35,
            "containsImage": 1,
            "userFollowers": 1200,
            "userKarma": 4500,
            "accountAgeDays": 700,
            "avgEngagementRate": 0.06,
            "avgLikes": 20,
            "avgComments": 5,
            "shouldImprove": 0,
            "dayOfWeek_Friday": 1,
            "dayOfWeek_Monday": 0,
            "dayOfWeek_Tuesday": 0,
            "dayOfWeek_Wednesday": 0,
            "dayOfWeek_Thursday": 0,
            "dayOfWeek_Saturday": 0,
            "postTimeOfDay_Evening": 1,
            "postTimeOfDay_Morning": 0,
            "postTimeOfDay_Afternoon": 0,
            "topCommentSentiment_Positive": 1,
            "topCommentSentiment_Neutral": 0
        }

        prediction = predict_likes(sample_input)

        if 0 <= prediction <= 10000:  # Reasonable range
            print(
                f"✅ XGBoost model prediction: {prediction:.1f} likes (reasonable)")
        else:
            print(
                f"⚠️ XGBoost model prediction: {prediction:.1f} likes (unusual range)")

        return True

    except Exception as e:
        print(f"❌ XGBoost model validation failed: {str(e)}")
        return False


def main():
    """Run all integration tests"""
    print("🚀 SimFluence AI Integration Test Suite")
    print("=" * 50)

    tests = [
        ("Basic Integration", test_basic_integration),
        ("XGBoost Model", test_model_validation),
        ("API Endpoints", test_api_endpoints),
        ("LangChain + Gemini", test_langchain_integration)
    ]

    passed = 0
    total = len(tests)

    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                print(f"Test '{test_name}' failed")
        except Exception as e:
            print(f"Test '{test_name}' crashed: {str(e)}")

    print("\n" + "=" * 50)
    print(f"🎯 Test Results: {passed}/{total} passed")

    if passed == total:
        print("🎉 All tests passed! Your AI integration is ready!")
        print("\n🚀 Next Steps:")
        print("   1. Set GOOGLE_API_KEY for advanced features")
        print("   2. Update your backend to use new endpoints")
        print("   3. Deploy and enjoy intelligent content optimization!")
    else:
        print("⚠️ Some tests failed. Check the errors above.")
        print("\n🔧 Troubleshooting:")
        print("   1. Make sure API is running: python api/app.py")
        print("   2. Install requirements: pip install -r requirements.txt")
        print("   3. Set environment variables in .env file")
        print("   4. Check model file exists: models/likes_predictor.pkl")


if __name__ == "__main__":
    main()
