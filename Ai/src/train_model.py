import os
import joblib
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error
from preprocess import load_and_preprocess_data
from sklearn.model_selection import train_test_split

# Constants
DATA_PATH = os.path.join("data", "simfluence_reddit_training.csv")
MODEL_SAVE_PATH = os.path.join("models", "likes_predictor.pkl")

def train_and_save_model():
    print("📦 Loading and preprocessing data...")
    df, feature_columns = load_and_preprocess_data(DATA_PATH)

    X = df[feature_columns]
    y_likes = df['receivedLikes']
    y_comments = df['receivedComments']

    # Split into train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_likes, test_size=0.2, random_state=42
    )
    _, _, y_train_comments, y_test_comments = train_test_split(
        X, y_comments, test_size=0.2, random_state=42
    )

    print("⚙️ Training XGBoost regression model...")
    model = XGBRegressor()
    model.fit(X_train, y_train)

    print("🧪 Evaluating model...")
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    print(f"✅ Model trained! MSE: {mse:.2f}")

    print("💾 Saving model to:", MODEL_SAVE_PATH)
    joblib.dump({
        "model": model,
        "features": feature_columns
    }, MODEL_SAVE_PATH)

    print("⚙️ Training XGBoost regression model for comments...")
    comments_model = XGBRegressor()
    comments_model.fit(X_train, y_train_comments)

    print("🧪 Evaluating comments model...")
    y_pred_comments = comments_model.predict(X_test)
    mse_comments = mean_squared_error(y_test_comments, y_pred_comments)
    print(f"✅ Comments model trained! MSE: {mse_comments:.2f}")

    print("💾 Saving comments model to: models/comments_predictor.pkl")
    joblib.dump({
        "model": comments_model,
        "features": feature_columns
    }, os.path.join("models", "comments_predictor.pkl"))

    y_shares = df['receivedShares']
    # Split for shares
    _, _, y_train_shares, y_test_shares = train_test_split(
        X, y_shares, test_size=0.2, random_state=42
    )

    print("⚙️ Training XGBoost regression model for shares...")
    shares_model = XGBRegressor()
    shares_model.fit(X_train, y_train_shares)

    print("🧪 Evaluating shares model...")
    y_pred_shares = shares_model.predict(X_test)
    mse_shares = mean_squared_error(y_test_shares, y_pred_shares)
    print(f"✅ Shares model trained! MSE: {mse_shares:.2f}")

    print("💾 Saving shares model to: models/shares_predictor.pkl")
    joblib.dump({
        "model": shares_model,
        "features": feature_columns
    }, os.path.join("models", "shares_predictor.pkl"))

if __name__ == "__main__":
    train_and_save_model()
