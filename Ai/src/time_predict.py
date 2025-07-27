import joblib
import os
from time_prediction import TimePredictionEngine

def load_time_prediction_model():
    """Load the time prediction model"""
    try:
        engine = TimePredictionEngine()
        engine.load_models()
        return engine
    except Exception as e:
        print(f"Warning: Could not load time prediction model: {e}")
        return None

def predict_optimal_time(subreddit: str, content_type: str = "text", user_data: dict = None):
    """
    Predict optimal posting time for a given subreddit and content type
    
    Args:
        subreddit: Target subreddit name
        content_type: Type of content (text, image, video, link)
        user_data: Optional user-specific data
        
    Returns:
        Dict with optimal hour and confidence
    """
    try:
        engine = load_time_prediction_model()
        if not engine:
            return {
                "optimal_hour": 12,  # Default to noon
                "confidence": 0.5,
                "status": "fallback"
            }
        
        prediction = engine.predict_optimal_time(subreddit, content_type, user_data)
        return prediction
        
    except Exception as e:
        print(f"Error in time prediction: {e}")
        return {
            "optimal_hour": 12,
            "confidence": 0.5,
            "status": "error",
            "error": str(e)
        }

def get_time_slot_name(hour: int) -> str:
    """Convert hour to time slot name"""
    if 0 <= hour < 6:
        return "Night"
    elif 6 <= hour < 12:
        return "Morning"
    elif 12 <= hour < 18:
        return "Afternoon"
    else:
        return "Evening"

def format_time_prediction(prediction: dict) -> dict:
    """Format time prediction for API response"""
    hour = prediction.get('optimal_hour', 12)
    
    return {
        "optimal_hour": hour,
        "optimal_time_slot": get_time_slot_name(hour),
        "formatted_time": f"{hour:02d}:00",
        "confidence": prediction.get('confidence', 0.5),
        "subreddit": prediction.get('subreddit', ''),
        "content_type": prediction.get('content_type', 'text'),
        "status": prediction.get('status', 'success'),
        "predictions": prediction.get('predictions', {}),
        "suggestions": [
            f"Best time to post in r/{prediction.get('subreddit', '')} is {hour:02d}:00",
            f"Time slot: {get_time_slot_name(hour)}",
            f"Confidence: {prediction.get('confidence', 0.5) * 100:.1f}%"
        ]
    }

if __name__ == "__main__":
    # Test the time prediction
    test_result = predict_optimal_time("funny", "image")
    formatted = format_time_prediction(test_result)
    print(f"Test prediction: {formatted}") 