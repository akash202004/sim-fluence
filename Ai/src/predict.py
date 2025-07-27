import joblib
import pandas as pd
import os

MODEL_PATH = os.path.join("models", "likes_predictor.pkl")

def load_model():
    print("📦 Loading model...")
    model_data = joblib.load(MODEL_PATH)
    return model_data["model"], model_data["features"]

def predict_likes(new_input: dict):
    model, feature_columns = load_model()

    # Create dataframe with expected feature columns
    input_df = pd.DataFrame([new_input])

    # Ensure all feature columns exist
    for col in feature_columns:
        if col not in input_df.columns:
            input_df[col] = 0  # fill missing with 0

    input_df = input_df[feature_columns]  # reorder to match training

    # Predict
    prediction = model.predict(input_df)
    return prediction[0]

def predict_comments(new_input: dict):
    model, feature_columns = load_comments_model()

    # Create dataframe with expected feature columns
    input_df = pd.DataFrame([new_input])

    # Ensure all feature columns exist
    for col in feature_columns:
        if col not in input_df.columns:
            input_df[col] = 0  # fill missing with 0

    input_df = input_df[feature_columns]  # reorder to match training

    # Predict
    prediction = model.predict(input_df)
    return prediction[0]

def predict_shares(new_input: dict):
    model, feature_columns = load_shares_model()

    # Create dataframe with expected feature columns
    input_df = pd.DataFrame([new_input])

    # Ensure all feature columns exist
    for col in feature_columns:
        if col not in input_df.columns:
            input_df[col] = 0  # fill missing with 0

    input_df = input_df[feature_columns]  # reorder to match training

    # Predict
    prediction = model.predict(input_df)
    return prediction[0]

def predict_engagement_category(predicted_likes):
    if predicted_likes < 10:
        return "low"
    elif predicted_likes < 50:
        return "medium"
    elif predicted_likes < 200:
        return "high"
    else:
        return "viral"

def load_comments_model():
    print("📦 Loading comments model...")
    model_data = joblib.load(os.path.join("models", "comments_predictor.pkl"))
    return model_data["model"], model_data["features"]

def load_shares_model():
    print("📦 Loading shares model...")
    model_data = joblib.load(os.path.join("models", "shares_predictor.pkl"))
    return model_data["model"], model_data["features"]

if __name__ == "__main__":
    # 🧪 Example input (must match feature format used in training)
    example_input = {
        "length": 35,
        "containsImage": 1,
        "userFollowers": 1200,
        "userFollowing": 300,
        "userKarma": 4500,
        "accountAgeDays": 700,
        "avgEngagementRate": 0.06,
        "avgLikes": 20,
        "avgComments": 5,
        "shouldImprove": 0,
        # dayOfWeek (Friday is the dropped category, so all 0)
        "dayOfWeek_Monday": 0,
        "dayOfWeek_Saturday": 0,
        "dayOfWeek_Sunday": 0,
        "dayOfWeek_Thursday": 0,
        "dayOfWeek_Tuesday": 0,
        "dayOfWeek_Wednesday": 0,
        # postTimeOfDay
        "postTimeOfDay_Evening": 1,
        "postTimeOfDay_Morning": 0,
        "postTimeOfDay_Night": 0,
        # topCommentSentiment
        "topCommentSentiment_Neutral": 0,
        "topCommentSentiment_Positive": 1
    }

    predicted_likes = predict_likes(example_input)
    predicted_comments = predict_comments(example_input)
    predicted_shares = predict_shares(example_input)
    print(f"🔮 Predicted Likes: {predicted_likes:.1f}")
    print(f"🔮 Predicted Comments: {predicted_comments:.1f}")
    print(f"🔮 Predicted Shares: {predicted_shares:.1f}")
