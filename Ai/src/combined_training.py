import os
import pandas as pd
import numpy as np
import joblib
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import re

# Constants
SIMFLUENCE_DATA_PATH = os.path.join("..", "data", "simfluence_reddit_training_ultimate.csv")
SARCASM_DATA_PATH = os.path.join("..", "data", "train-balanced-sarcasm.csv")
MODEL_SAVE_PATH = os.path.join("..", "models", "combined_likes_predictor.pkl")

def load_simfluence_data():
    """Load and preprocess the simfluence dataset"""
    print("📊 Loading Simfluence dataset...")
    df = pd.read_csv(SIMFLUENCE_DATA_PATH)
    print(f"Simfluence dataset shape: {df.shape}")
    
    # Convert string boolean to int
    df['containsImage'] = df['containsImage'].map({'True': 1, 'False': 0})
    df['shouldImprove'] = df['shouldImprove'].map({'True': 1, 'False': 0})
    
    # Convert numeric columns
    numeric_columns = ['length', 'userFollowers', 'userFollowing', 'userKarma', 
                      'accountAgeDays', 'avgEngagementRate', 'avgLikes', 'avgComments',
                      'receivedLikes', 'receivedComments', 'receivedShares']
    
    for col in numeric_columns:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            if df[col].isnull().sum() > 0:
                median_val = df[col].median()
                df[col] = df[col].fillna(median_val)
    
    # Handle categorical columns
    categorical_columns = ['postTimeOfDay', 'dayOfWeek', 'topCommentSentiment']
    for col in categorical_columns:
        if col in df.columns and df[col].isnull().sum() > 0:
            mode_val = df[col].mode()[0]
            df[col] = df[col].fillna(mode_val)
    
    # One-hot encode categorical features
    df = pd.get_dummies(df, columns=categorical_columns, drop_first=True)
    
    return df

def load_sarcasm_data():
    """Load and preprocess the sarcasm dataset"""
    print("📊 Loading Sarcasm dataset...")
    df = pd.read_csv(SARCASM_DATA_PATH)
    print(f"Sarcasm dataset shape: {df.shape}")
    
    # Clean and handle missing values
    print("🧹 Cleaning data and handling missing values...")
    
    # Remove rows with missing comments
    df = df.dropna(subset=['comment'])
    print(f"After removing missing comments: {df.shape}")
    
    # Fill missing values in other columns
    df['comment'] = df['comment'].fillna('')
    df['subreddit'] = df['subreddit'].fillna('unknown')
    df['score'] = df['score'].fillna(0)
    df['ups'] = df['ups'].fillna(0)
    df['downs'] = df['downs'].fillna(0)
    
    # Create features from sarcasm data with safe conversion
    df['comment_length'] = df['comment'].str.len().fillna(0)
    df['word_count'] = df['comment'].str.split().str.len().fillna(0)
    
    # Safe boolean conversions with fillna
    df['has_question'] = df['comment'].str.contains('\?', regex=True, na=False).astype(int)
    df['has_exclamation'] = df['comment'].str.contains('\!', regex=True, na=False).astype(int)
    df['has_uppercase'] = df['comment'].str.isupper().fillna(False).astype(int)
    df['has_numbers'] = df['comment'].str.contains(r'\d', regex=True, na=False).astype(int)
    
    # Create engagement features (using score as proxy for likes)
    df['engagement_score'] = df['score'].abs()
    df['upvote_ratio'] = df['ups'] / (df['ups'] + df['downs'].abs()).replace(0, 1)
    
    # Create time-based features with error handling
    print("📅 Processing time-based features...")
    try:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        # Remove rows with invalid dates
        df = df.dropna(subset=['date'])
        print(f"After removing invalid dates: {df.shape}")
        
        df['day_of_week'] = df['date'].dt.day_name()
        df['hour'] = df['date'].dt.hour
        df['time_of_day'] = pd.cut(df['hour'], bins=[0, 6, 12, 18, 24], 
                                  labels=['night', 'morning', 'afternoon', 'evening'])
    except Exception as e:
        print(f"⚠️ Warning: Error processing dates: {e}")
        # Use default values if date processing fails
        df['day_of_week'] = 'Monday'
        df['time_of_day'] = 'afternoon'
    
    # Encode categorical variables with error handling
    print("🔤 Encoding categorical variables...")
    try:
        le_subreddit = LabelEncoder()
        le_day = LabelEncoder()
        le_time = LabelEncoder()
        
        df['subreddit_encoded'] = le_subreddit.fit_transform(df['subreddit'].fillna('unknown'))
        df['day_encoded'] = le_day.fit_transform(df['day_of_week'].fillna('Monday'))
        df['time_encoded'] = le_time.fit_transform(df['time_of_day'].fillna('afternoon'))
    except Exception as e:
        print(f"⚠️ Warning: Error encoding categorical variables: {e}")
        # Use default encoded values
        df['subreddit_encoded'] = 0
        df['day_encoded'] = 0
        df['time_encoded'] = 0
    
    # Select relevant features
    feature_columns = ['comment_length', 'word_count', 'has_question', 'has_exclamation',
                      'has_uppercase', 'has_numbers', 'engagement_score', 'upvote_ratio',
                      'subreddit_encoded', 'day_encoded', 'time_encoded']
    
    # Final data validation
    print("✅ Final data validation...")
    print(f"Final sarcasm dataset shape: {df.shape}")
    print(f"Missing values in features: {df[feature_columns].isnull().sum().sum()}")
    
    # Remove any remaining rows with missing values in features
    df = df.dropna(subset=feature_columns)
    print(f"After final cleanup: {df.shape}")
    
    return df, feature_columns

def combine_datasets(simfluence_df, sarcasm_df, sarcasm_features):
    """Combine both datasets for training"""
    print("🔄 Combining datasets...")
    
    # For simfluence data, use existing features
    simfluence_features = simfluence_df.drop([
        'receivedLikes', 'receivedComments', 'receivedShares',
        'suggestions', 'postText', 'hashtags'
    ], axis=1).columns.tolist()
    
    # Create a combined dataset
    # We'll use simfluence data as primary and augment with sarcasm insights
    combined_df = simfluence_df.copy()
    
    # Add sarcasm-derived features to simfluence data
    combined_df['avg_comment_length'] = sarcasm_df['comment_length'].mean()
    combined_df['avg_word_count'] = sarcasm_df['word_count'].mean()
    combined_df['sarcasm_engagement_ratio'] = sarcasm_df['upvote_ratio'].mean()
    
    # Create enhanced features
    combined_df['text_complexity'] = combined_df['length'] * combined_df['avg_word_count']
    combined_df['engagement_potential'] = combined_df['avgEngagementRate'] * combined_df['sarcasm_engagement_ratio']
    
    print(f"Combined dataset shape: {combined_df.shape}")
    return combined_df

def train_combined_models(combined_df):
    """Train models using combined dataset"""
    print("🚀 Training combined models...")
    
    # Define feature columns (excluding target variables and text fields)
    feature_columns = [col for col in combined_df.columns 
                      if col not in ['receivedLikes', 'receivedComments', 'receivedShares',
                                   'suggestions', 'postText', 'hashtags']]
    
    X = combined_df[feature_columns]
    y_likes = combined_df['receivedLikes']
    y_comments = combined_df['receivedComments']
    y_shares = combined_df['receivedShares']
    
    # Split data
    X_train, X_test, y_train_likes, y_test_likes = train_test_split(
        X, y_likes, test_size=0.2, random_state=42
    )
    _, _, y_train_comments, y_test_comments = train_test_split(
        X, y_comments, test_size=0.2, random_state=42
    )
    _, _, y_train_shares, y_test_shares = train_test_split(
        X, y_shares, test_size=0.2, random_state=42
    )
    
    # Train Likes Model
    print("⚙️ Training XGBoost model for likes prediction...")
    likes_model = XGBRegressor(n_estimators=200, learning_rate=0.1, random_state=42)
    likes_model.fit(X_train, y_train_likes)
    
    y_pred_likes = likes_model.predict(X_test)
    mse_likes = mean_squared_error(y_test_likes, y_pred_likes)
    r2_likes = r2_score(y_test_likes, y_pred_likes)
    print(f"✅ Likes Model - MSE: {mse_likes:.2f}, R²: {r2_likes:.3f}")
    
    # Train Comments Model
    print("⚙️ Training XGBoost model for comments prediction...")
    comments_model = XGBRegressor(n_estimators=200, learning_rate=0.1, random_state=42)
    comments_model.fit(X_train, y_train_comments)
    
    y_pred_comments = comments_model.predict(X_test)
    mse_comments = mean_squared_error(y_test_comments, y_pred_comments)
    r2_comments = r2_score(y_test_comments, y_pred_comments)
    print(f"✅ Comments Model - MSE: {mse_comments:.2f}, R²: {r2_comments:.3f}")
    
    # Train Shares Model
    print("⚙️ Training XGBoost model for shares prediction...")
    shares_model = XGBRegressor(n_estimators=200, learning_rate=0.1, random_state=42)
    shares_model.fit(X_train, y_train_shares)
    
    y_pred_shares = shares_model.predict(X_test)
    mse_shares = mean_squared_error(y_test_shares, y_pred_shares)
    r2_shares = r2_score(y_test_shares, y_pred_shares)
    print(f"✅ Shares Model - MSE: {mse_shares:.2f}, R²: {r2_shares:.3f}")
    
    # Save models
    print("💾 Saving combined models...")
    joblib.dump({
        "model": likes_model,
        "features": feature_columns,
        "dataset_info": "Combined Simfluence + Sarcasm"
    }, os.path.join("..", "models", "combined_likes_predictor.pkl"))
    
    joblib.dump({
        "model": comments_model,
        "features": feature_columns,
        "dataset_info": "Combined Simfluence + Sarcasm"
    }, os.path.join("..", "models", "combined_comments_predictor.pkl"))
    
    joblib.dump({
        "model": shares_model,
        "features": feature_columns,
        "dataset_info": "Combined Simfluence + Sarcasm"
    }, os.path.join("..", "models", "combined_shares_predictor.pkl"))
    
    return {
        'likes_model': likes_model,
        'comments_model': comments_model,
        'shares_model': shares_model,
        'feature_columns': feature_columns,
        'metrics': {
            'likes': {'mse': mse_likes, 'r2': r2_likes},
            'comments': {'mse': mse_comments, 'r2': r2_comments},
            'shares': {'mse': mse_shares, 'r2': r2_shares}
        }
    }

def main():
    """Main training function"""
    print("🎯 COMBINED DATASET TRAINING")
    print("=" * 60)
    
    try:
        # Load both datasets
        print("📊 Loading datasets...")
        simfluence_df = load_simfluence_data()
        sarcasm_df, sarcasm_features = load_sarcasm_data()
        
        # Combine datasets
        print("🔄 Combining datasets...")
        combined_df = combine_datasets(simfluence_df, sarcasm_df, sarcasm_features)
        
        # Train models
        print("🚀 Training models...")
        results = train_combined_models(combined_df)
        
        # Print summary
        print("\n📈 TRAINING SUMMARY")
        print("=" * 60)
        print(f"Combined dataset size: {combined_df.shape[0]} samples")
        print(f"Number of features: {len(results['feature_columns'])}")
        print("\nModel Performance:")
        for metric, values in results['metrics'].items():
            print(f"  {metric.capitalize()}: MSE={values['mse']:.2f}, R²={values['r2']:.3f}")
        
        print(f"\n✅ Models saved to ../models/")
        print("🎉 Combined training completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error during training: {e}")
        print("🔧 Attempting to continue with simfluence data only...")
        
        try:
            # Fallback to simfluence data only
            print("📊 Loading simfluence data only...")
            simfluence_df = load_simfluence_data()
            
            # Train with simfluence data only
            print("🚀 Training with simfluence data only...")
            results = train_combined_models(simfluence_df)
            
            print("\n📈 FALLBACK TRAINING SUMMARY")
            print("=" * 60)
            print(f"Dataset size: {simfluence_df.shape[0]} samples")
            print(f"Number of features: {len(results['feature_columns'])}")
            print("\nModel Performance:")
            for metric, values in results['metrics'].items():
                print(f"  {metric.capitalize()}: MSE={values['mse']:.2f}, R²={values['r2']:.3f}")
            
            print(f"\n✅ Models saved to ../models/")
            print("🎉 Fallback training completed successfully!")
            
        except Exception as fallback_error:
            print(f"\n❌ Fallback training also failed: {fallback_error}")
            print("💡 Please check your data files and try again.")

if __name__ == "__main__":
    main() 