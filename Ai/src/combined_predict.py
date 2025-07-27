import os
import pandas as pd
import numpy as np
import joblib
# Removed preprocess import as it's no longer needed

# Constants
COMBINED_LIKES_MODEL_PATH = os.path.join("..", "models", "combined_likes_predictor.pkl")
COMBINED_COMMENTS_MODEL_PATH = os.path.join("..", "models", "combined_comments_predictor.pkl")
COMBINED_SHARES_MODEL_PATH = os.path.join("..", "models", "combined_shares_predictor.pkl")

def load_combined_models():
    """Load all combined models"""
    print("📦 Loading combined models...")
    
    try:
        likes_model_data = joblib.load(COMBINED_LIKES_MODEL_PATH)
        comments_model_data = joblib.load(COMBINED_COMMENTS_MODEL_PATH)
        shares_model_data = joblib.load(COMBINED_SHARES_MODEL_PATH)
        
        print("✅ All combined models loaded successfully!")
        return likes_model_data, comments_model_data, shares_model_data
    except FileNotFoundError as e:
        print(f"❌ Error: Combined models not found. Please run combined_training.py first.")
        print(f"Missing file: {e}")
        return None, None, None

def prepare_input_features(post_data):
    """Prepare input features for prediction"""
    # Create a DataFrame with the input data
    df = pd.DataFrame([post_data])
    
    # Add sarcasm-derived features (using averages from training)
    df['avg_comment_length'] = 150  # Average from sarcasm dataset
    df['avg_word_count'] = 25       # Average from sarcasm dataset
    df['sarcasm_engagement_ratio'] = 0.75  # Average upvote ratio
    
    # Create enhanced features
    df['text_complexity'] = df['length'] * df['avg_word_count']
    df['engagement_potential'] = df['avgEngagementRate'] * df['sarcasm_engagement_ratio']
    
    # Create one-hot encoded categorical features
    # Time of day features
    time_slots = ['morning', 'afternoon', 'evening', 'night', 'midnight', 'early_morning']
    for slot in time_slots:
        df[f'postTimeOfDay_{slot.title()}'] = 0
    if 'postTimeOfDay' in df.columns:
        time_value = df['postTimeOfDay'].iloc[0].lower()
        if time_value in [slot.lower() for slot in time_slots]:
            df[f'postTimeOfDay_{time_value.title()}'] = 1
    
    # Day of week features
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    for day in days:
        df[f'dayOfWeek_{day}'] = 0
    if 'dayOfWeek' in df.columns:
        day_value = df['dayOfWeek'].iloc[0]
        if day_value in days:
            df[f'dayOfWeek_{day_value}'] = 1
    
    # Sentiment features
    sentiments = ['positive', 'negative', 'neutral', 'humorous']
    for sentiment in sentiments:
        df[f'topCommentSentiment_{sentiment.title()}'] = 0
    if 'topCommentSentiment' in df.columns:
        sentiment_value = df['topCommentSentiment'].iloc[0].lower()
        if sentiment_value in [s.lower() for s in sentiments]:
            df[f'topCommentSentiment_{sentiment_value.title()}'] = 1
    
    return df

def predict_engagement(post_data):
    """Predict engagement using combined models"""
    # Load models
    likes_model_data, comments_model_data, shares_model_data = load_combined_models()
    
    if likes_model_data is None:
        return None
    
    # Prepare input features
    input_df = prepare_input_features(post_data)
    
    # Get feature columns from the model
    feature_columns = likes_model_data['features']
    
    # Ensure all required features are present
    missing_features = set(feature_columns) - set(input_df.columns)
    if missing_features:
        print(f"⚠️ Missing features: {missing_features}")
        # Add missing features with default values
        for feature in missing_features:
            input_df[feature] = 0
    
    # Select only the features used by the model
    X = input_df[feature_columns]
    
    # Make predictions
    likes_model = likes_model_data['model']
    comments_model = comments_model_data['model']
    shares_model = shares_model_data['model']
    
    predicted_likes = likes_model.predict(X)[0]
    predicted_comments = comments_model.predict(X)[0]
    predicted_shares = shares_model.predict(X)[0]
    
    return {
        'predicted_likes': max(0, int(round(predicted_likes))),
        'predicted_comments': max(0, int(round(predicted_comments))),
        'predicted_shares': max(0, int(round(predicted_shares))),
        'model_info': likes_model_data['dataset_info']
    }

def predict_from_text(post_text, user_data=None):
    """Predict engagement from post text and optional user data"""
    # Default user data if not provided
    if user_data is None:
        user_data = {
            'userFollowers': 1000,
            'userFollowing': 500,
            'userKarma': 5000,
            'accountAgeDays': 365,
            'avgEngagementRate': 0.05,
            'avgLikes': 50,
            'avgComments': 10
        }
    
    # Create post data
    post_data = {
        'postText': post_text,
        'length': len(post_text),
        'containsImage': 0,
        'postTimeOfDay': 'afternoon',
        'dayOfWeek': 'Monday',
        'topCommentSentiment': 'positive',
        'shouldImprove': 0,
        **user_data
    }
    
    return predict_engagement(post_data)

def main():
    """Main function for testing predictions"""
    print("🎯 COMBINED MODEL PREDICTION")
    print("=" * 50)
    
    # Test with sample post
    sample_post = "AI in marketing is revolutionizing how businesses connect with customers. The future is here!"
    sample_user = {
        'userFollowers': 2000,
        'userFollowing': 800,
        'userKarma': 7500,
        'accountAgeDays': 730,
        'avgEngagementRate': 0.08,
        'avgLikes': 80,
        'avgComments': 15
    }
    
    print(f"📝 Sample post: {sample_post}")
    print(f"👤 User data: {sample_user}")
    
    # Make prediction
    result = predict_from_text(sample_post, sample_user)
    
    if result:
        print("\n📊 PREDICTION RESULTS")
        print("=" * 50)
        print(f"Predicted Likes: {result['predicted_likes']}")
        print(f"Predicted Comments: {result['predicted_comments']}")
        print(f"Predicted Shares: {result['predicted_shares']}")
        print(f"Model: {result['model_info']}")
    else:
        print("❌ Prediction failed. Please ensure models are trained first.")

if __name__ == "__main__":
    main() 