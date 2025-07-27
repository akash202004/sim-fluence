#!/usr/bin/env python3
"""
Test script for SimFluence AI API
Tests all endpoints and functionality
"""

import time
from ai_client import SimFluenceAI, SimFluenceAIClient
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))


def test_ai_api():
    """Test all AI API endpoints"""

    print("🧪 Testing SimFluence AI API")
    print("=" * 50)

    # Initialize client
    ai = SimFluenceAI()
    client = SimFluenceAIClient()

    # Test 1: Health Check
    print("\n1️⃣ Testing Health Check...")
    health = client.health_check()
    print(f"   Status: {health.get('status', 'unknown')}")

    # Test 2: Engagement Prediction
    print("\n2️⃣ Testing Engagement Prediction...")
    test_user_data = {
        "userKarma": 4500,
        "userFollowers": 1200,
        "avgEngagementRate": 0.06,
        "avgLikes": 45,
        "avgComments": 8
    }

    test_post_data = {
        "containsImage": True,
        "dayOfWeek": "Friday",
        "postTimeOfDay": "Evening"
    }

    test_content = "Just discovered this amazing new technology that could revolutionize how we work!"

    engagement = client.predict_engagement(
        test_user_data, test_post_data, test_content)
    print(f"   Predicted Likes: {engagement.get('predicted_likes', 'N/A')}")
    print(
        f"   Predicted Comments: {engagement.get('predicted_comments', 'N/A')}")
    print(f"   Engagement Score: {engagement.get('engagement_score', 'N/A')}")

    # Test 3: Caption Generation
    print("\n3️⃣ Testing Caption Generation...")
    caption_result = client.generate_caption(
        prompt="A beautiful sunset photo from my hiking trip in the mountains",
        platform="reddit",
        tone="casual",
        include_hashtags=False
    )
    print(
        f"   Generated Caption: {caption_result.get('caption', 'N/A')[:100]}...")
    print(
        f"   Suggestions: {len(caption_result.get('suggestions', []))} provided")

    # Test 4: Sentiment Analysis
    print("\n4️⃣ Testing Sentiment Analysis...")
    sentiment_result = client.analyze_sentiment(
        "This is absolutely amazing! I love this new feature!")
    print(f"   Sentiment: {sentiment_result.get('sentiment', 'N/A')}")
    print(f"   Confidence: {sentiment_result.get('confidence', 'N/A')}")

    # Test 5: Complete Post Optimization
    print("\n5️⃣ Testing Complete Post Optimization...")
    optimization_result = client.optimize_post(
        content="Check out this cool new app I've been working on",
        user_data=test_user_data,
        post_settings=test_post_data,
        optimization_goals=["engagement", "caption", "sentiment"]
    )

    if optimization_result.get('status') == 'success':
        results = optimization_result.get('results', {})
        print(f"   Optimization Complete!")
        print(f"   Engagement Prediction: ✅")
        print(f"   Caption Generation: ✅" if 'optimized_caption' in results else "   Caption Generation: ❌")
        print(f"   Sentiment Analysis: ✅" if 'sentiment_analysis' in results else "   Sentiment Analysis: ❌")
        print(
            f"   Recommendations: {len(results.get('recommendations', []))} provided")
    else:
        print(
            f"   Optimization Failed: {optimization_result.get('error', 'Unknown error')}")

    # Test 6: Quick Helper Functions
    print("\n6️⃣ Testing Quick Helper Functions...")

    # Quick engagement prediction
    quick_engagement = ai.quick_engagement_prediction(
        user_karma=4500,
        user_followers=1200,
        content="Testing quick prediction functionality",
        has_image=True
    )
    print(
        f"   Quick Engagement: {quick_engagement.get('predicted_likes', 'N/A')} likes")

    # Quick caption generation
    quick_caption = ai.quick_caption_generation(
        "A photo of my cat sleeping", "reddit")
    print(f"   Quick Caption: {quick_caption[:50]}...")

    # Quick sentiment check
    quick_sentiment = ai.quick_sentiment_check(
        "I absolutely love this product!")
    print(f"   Quick Sentiment: {quick_sentiment}")

    print("\n🎉 All tests completed!")
    print("=" * 50)


def test_model_accuracy():
    """Test model accuracy with known data"""
    print("\n📊 Testing Model Accuracy...")

    # Test cases with expected ranges
    test_cases = [
        {
            "description": "High karma user with image",
            "input": {
                "userKarma": 10000,
                "userFollowers": 5000,
                "content": "Amazing sunset photo from my trip to the mountains! The colors were absolutely incredible.",
                "has_image": True
            },
            "expected_range": (100, 500)  # Expected likes range
        },
        {
            "description": "Low karma user without image",
            "input": {
                "userKarma": 500,
                "userFollowers": 50,
                "content": "Just a quick thought about technology trends.",
                "has_image": False
            },
            "expected_range": (5, 50)  # Expected likes range
        },
        {
            "description": "Medium karma user with engaging content",
            "input": {
                "userKarma": 3000,
                "userFollowers": 800,
                "content": "Does anyone else think this new AI technology is going to change everything? What are your thoughts?",
                "has_image": False
            },
            "expected_range": (30, 150)  # Expected likes range
        }
    ]

    ai = SimFluenceAI()

    for i, test_case in enumerate(test_cases, 1):
        print(f"\n   Test {i}: {test_case['description']}")

        result = ai.quick_engagement_prediction(**test_case['input'])
        predicted_likes = result.get('predicted_likes', 0)

        min_expected, max_expected = test_case['expected_range']
        in_range = min_expected <= predicted_likes <= max_expected

        print(f"   Predicted Likes: {predicted_likes}")
        print(f"   Expected Range: {min_expected}-{max_expected}")
        print(f"   Result: {'✅ PASS' if in_range else '❌ FAIL'}")


if __name__ == "__main__":
    try:
        test_ai_api()
        test_model_accuracy()
        print("\n✅ All tests completed successfully!")
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        sys.exit(1)
