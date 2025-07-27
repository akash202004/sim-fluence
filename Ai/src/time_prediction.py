import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import joblib
from xgboost import XGBRegressor, XGBClassifier
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error, accuracy_score
import warnings
warnings.filterwarnings('ignore')

class TimePredictionEngine:
    """
    Advanced time prediction engine for optimal posting times
    Maintains separate models for different subreddits and content types
    """
    
    def __init__(self, data_path: str = "data/timeline"):
        self.data_path = data_path
        self.models = {}
        self.feature_columns = []
        self.subreddit_models = {}
        self.content_type_models = {}
        self.global_model = None
        
    def load_and_consolidate_data(self) -> pd.DataFrame:
        """
        Load and consolidate all timeline CSV files
        """
        print("📊 Loading and consolidating timeline data...")
        
        all_data = []
        timeline_dir = os.path.join(self.data_path)
        
        if not os.path.exists(timeline_dir):
            print(f"❌ Timeline directory not found: {timeline_dir}")
            return pd.DataFrame()
        
        # Load each subreddit CSV file
        for filename in os.listdir(timeline_dir):
            if filename.endswith('.csv') and filename != '50_subreddits_list.csv':
                subreddit_name = filename.replace('.csv', '')
                file_path = os.path.join(timeline_dir, filename)
                
                try:
                    df = pd.read_csv(file_path, low_memory=False)
                    df['subreddit'] = subreddit_name
                    all_data.append(df)
                    print(f"✅ Loaded {subreddit_name}: {len(df)} posts")
                except Exception as e:
                    print(f"❌ Error loading {filename}: {str(e)}")
                    print(f"   ⚠️  Skipping corrupted file: {filename}")
        
        if not all_data:
            print("❌ No data files found!")
            return pd.DataFrame()
        
        # Consolidate all data
        consolidated_df = pd.concat(all_data, ignore_index=True)
        print(f"📈 Total consolidated data: {len(consolidated_df)} posts from {len(all_data)} subreddits")
        
        return consolidated_df
    
    def engineer_time_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Engineer comprehensive time-based features
        """
        print("🔧 Engineering time features...")
        
        # Convert timestamp to datetime with error handling
        print("   📅 Converting timestamps...")
        original_count = len(df)
        
        # Try different date formats and handle errors
        df['created_datetime'] = pd.to_datetime(
            df['created_utc'], 
            errors='coerce',  # Convert errors to NaT
            format='mixed'    # Try to infer format for each row
        )
        
        # Remove rows with invalid timestamps
        invalid_timestamps = df['created_datetime'].isna().sum()
        if invalid_timestamps > 0:
            print(f"   ⚠️  Found {invalid_timestamps} invalid timestamps, removing...")
            df = df.dropna(subset=['created_datetime'])
            print(f"   ✅ Kept {len(df)} valid rows out of {original_count}")
        
        # Extract temporal features
        df['hour'] = df['created_datetime'].dt.hour
        df['day_of_week'] = df['created_datetime'].dt.dayofweek
        df['day_of_month'] = df['created_datetime'].dt.day
        df['month'] = df['created_datetime'].dt.month
        df['year'] = df['created_datetime'].dt.year
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # Create seasons
        df['season'] = df['month'].map({
            12: 'Winter', 1: 'Winter', 2: 'Winter',
            3: 'Spring', 4: 'Spring', 5: 'Spring',
            6: 'Summer', 7: 'Summer', 8: 'Summer',
            9: 'Fall', 10: 'Fall', 11: 'Fall'
        })
        
        # Time slots
        df['time_slot'] = pd.cut(df['hour'], 
                                bins=[0, 6, 12, 18, 24], 
                                labels=['Night', 'Morning', 'Afternoon', 'Evening'])
        
        # Content features
        df['title_length'] = df['title'].str.len()
        df['has_body'] = df['body'].notna().astype(int)
        df['body_length'] = df['body'].str.len().fillna(0)
        
        # Post type features
        df['is_image'] = (df['post_type'] == 'image').astype(int)
        df['is_video'] = (df['post_type'] == 'video').astype(int)
        df['is_text'] = (df['post_type'] == 'text').astype(int)
        df['is_link'] = (df['post_type'] == 'link').astype(int)
        
        # Engagement features
        df['engagement_score'] = df['score'] * df['upvote_ratio'] * (1 + df['num_comments'] * 0.1)
        
        # Handle missing values
        numeric_columns = ['score', 'upvote_ratio', 'num_comments', 'num_awards', 'num_crossposts']
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
                print(f"   📊 Processed {col} column")
        
        print(f"✅ Engineered features for {len(df)} posts")
        return df
    
    def create_optimal_time_targets(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create target variables for optimal posting times
        """
        print("🎯 Creating optimal time targets...")
        
        # Group by subreddit and hour to find optimal times
        optimal_times = df.groupby(['subreddit', 'hour']).agg({
            'engagement_score': 'mean',
            'score': 'mean',
            'num_comments': 'mean'
        }).reset_index()
        
        # Find the best hour for each subreddit
        best_hours = optimal_times.loc[optimal_times.groupby('subreddit')['engagement_score'].idxmax()]
        
        # Create target: optimal hour (0-23)
        df['optimal_hour'] = df['subreddit'].map(
            dict(zip(best_hours['subreddit'], best_hours['hour']))
        )
        
        # Create binary target: is this the optimal hour?
        df['is_optimal_hour'] = (df['hour'] == df['optimal_hour']).astype(int)
        
        # Create engagement prediction target
        df['hour_engagement_score'] = df.groupby(['subreddit', 'hour'])['engagement_score'].transform('mean')
        
        print(f"✅ Created optimal time targets")
        return df
    
    def prepare_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
        """
        Prepare final feature set for model training
        """
        print("🔧 Preparing final features...")
        
        # Select features for model training
        feature_columns = [
            'hour', 'day_of_week', 'day_of_month', 'month', 'year',
            'is_weekend', 'title_length', 'has_body', 'body_length',
            'is_image', 'is_video', 'is_text', 'is_link',
            'score', 'upvote_ratio', 'num_comments', 'num_awards', 'num_crossposts',
            'subscribers'
        ]
        
        # One-hot encode categorical features
        categorical_features = ['season', 'time_slot', 'subreddit']
        for feature in categorical_features:
            if feature in df.columns:
                dummies = pd.get_dummies(df[feature], prefix=feature)
                df = pd.concat([df, dummies], axis=1)
                feature_columns.extend(dummies.columns.tolist())
        
        # Ensure all feature columns exist
        for col in feature_columns:
            if col not in df.columns:
                df[col] = 0
        
        # Select only the feature columns
        X = df[feature_columns].copy()
        
        # Handle any remaining missing values
        X = X.fillna(0)
        
        print(f"✅ Prepared {len(feature_columns)} features")
        return X, feature_columns
    
    def train_time_prediction_models(self, df: pd.DataFrame) -> Dict:
        """
        Train multiple specialized time prediction models
        """
        print("🤖 Training time prediction models...")
        
        # Prepare features
        X, feature_columns = self.prepare_features(df)
        self.feature_columns = feature_columns
        
        # Prepare targets
        y_hour = df['optimal_hour']
        y_engagement = df['hour_engagement_score']
        y_optimal = df['is_optimal_hour']
        
        # Train global model for hour prediction
        print("📊 Training global hour prediction model...")
        global_model = XGBRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        )
        
        # Use time series split for validation
        tscv = TimeSeriesSplit(n_splits=5)
        
        # Train the model
        global_model.fit(X, y_hour)
        
        # Evaluate
        y_pred = global_model.predict(X)
        mse = mean_squared_error(y_hour, y_pred)
        print(f"✅ Global model trained - MSE: {mse:.2f}")
        
        # Train subreddit-specific models
        print("📊 Training subreddit-specific models...")
        subreddit_models = {}
        
        for subreddit in df['subreddit'].unique():
            subreddit_data = df[df['subreddit'] == subreddit]
            if len(subreddit_data) > 100:  # Only train if enough data
                X_sub = X[df['subreddit'] == subreddit]
                y_sub = y_hour[df['subreddit'] == subreddit]
                
                model = XGBRegressor(n_estimators=50, max_depth=4, random_state=42)
                model.fit(X_sub, y_sub)
                subreddit_models[subreddit] = model
                print(f"✅ Trained model for r/{subreddit}")
        
        # Train content-type models
        print("📊 Training content-type models...")
        content_models = {}
        
        for content_type in ['is_image', 'is_video', 'is_text', 'is_link']:
            content_data = df[df[content_type] == 1]
            if len(content_data) > 100:
                X_content = X[df[content_type] == 1]
                y_content = y_hour[df[content_type] == 1]
                
                model = XGBRegressor(n_estimators=50, max_depth=4, random_state=42)
                model.fit(X_content, y_content)
                content_models[content_type] = model
                print(f"✅ Trained model for {content_type}")
        
        # Store models
        self.global_model = global_model
        self.subreddit_models = subreddit_models
        self.content_type_models = content_models
        
        print(f"✅ Training complete - {len(subreddit_models)} subreddit models, {len(content_models)} content models")
        
        return {
            'global_model': global_model,
            'subreddit_models': subreddit_models,
            'content_type_models': content_models,
            'feature_columns': feature_columns
        }
    
    def predict_optimal_time(self, 
                           subreddit: str,
                           content_type: str = 'text',
                           user_data: Dict = None) -> Dict:
        """
        Predict optimal posting time for given parameters
        """
        if not self.global_model:
            return {"error": "Models not trained yet"}
        
        # Prepare input features
        input_features = self._prepare_prediction_input(subreddit, content_type, user_data)
        
        # Get predictions from different models
        predictions = {}
        
        # Global model prediction
        if self.global_model:
            global_pred = self.global_model.predict([input_features])[0]
            predictions['global'] = round(global_pred) % 24
        
        # Subreddit-specific prediction
        if subreddit in self.subreddit_models:
            subreddit_pred = self.subreddit_models[subreddit].predict([input_features])[0]
            predictions['subreddit'] = round(subreddit_pred) % 24
        
        # Content-type prediction
        content_key = f'is_{content_type}'
        if content_key in self.content_type_models:
            content_pred = self.content_type_models[content_key].predict([input_features])[0]
            predictions['content_type'] = round(content_pred) % 24
        
        # Ensemble prediction (weighted average)
        if len(predictions) > 1:
            weights = {'global': 0.3, 'subreddit': 0.5, 'content_type': 0.2}
            ensemble_pred = sum(predictions[key] * weights.get(key, 0.3) 
                              for key in predictions.keys())
            predictions['ensemble'] = round(ensemble_pred) % 24
        
        # Get confidence scores
        confidence = self._calculate_confidence(predictions)
        
        return {
            'optimal_hour': predictions.get('ensemble', predictions.get('global', 12)),
            'predictions': predictions,
            'confidence': confidence,
            'subreddit': subreddit,
            'content_type': content_type,
            'status': 'success'
        }
    
    def _prepare_prediction_input(self, subreddit: str, content_type: str, user_data: Dict) -> List:
        """
        Prepare input features for prediction
        """
        # Create base features (all zeros)
        input_features = [0] * len(self.feature_columns)
        
        # Set basic features
        feature_dict = dict(zip(self.feature_columns, input_features))
        
        # Set content type
        content_key = f'is_{content_type}'
        if content_key in feature_dict:
            feature_dict[content_key] = 1
        
        # Set subreddit (if available)
        subreddit_key = f'subreddit_{subreddit}'
        if subreddit_key in feature_dict:
            feature_dict[subreddit_key] = 1
        
        # Set user data if provided
        if user_data:
            for key, value in user_data.items():
                if key in feature_dict:
                    feature_dict[key] = value
        
        return list(feature_dict.values())
    
    def _calculate_confidence(self, predictions: Dict) -> float:
        """
        Calculate confidence score based on prediction agreement
        """
        if len(predictions) == 1:
            return 0.7  # Base confidence for single model
        
        # Calculate variance in predictions
        values = list(predictions.values())
        variance = np.var(values)
        
        # Higher variance = lower confidence
        confidence = max(0.3, 1.0 - (variance / 100))
        return round(confidence, 2)
    
    def save_models(self, save_path: str = "models"):
        """
        Save trained models
        """
        if not os.path.exists(save_path):
            os.makedirs(save_path)
        
        # Save global model
        if self.global_model:
            joblib.dump({
                'model': self.global_model,
                'feature_columns': self.feature_columns
            }, os.path.join(save_path, 'time_prediction_global.pkl'))
        
        # Save subreddit models
        for subreddit, model in self.subreddit_models.items():
            joblib.dump({
                'model': model,
                'feature_columns': self.feature_columns
            }, os.path.join(save_path, f'time_prediction_{subreddit}.pkl'))
        
        print(f"✅ Models saved to {save_path}")
    
    def load_models(self, load_path: str = "models"):
        """
        Load trained models
        """
        # Load global model
        global_model_path = os.path.join(load_path, 'time_prediction_global.pkl')
        if os.path.exists(global_model_path):
            global_data = joblib.load(global_model_path)
            self.global_model = global_data['model']
            self.feature_columns = global_data['feature_columns']
            print("✅ Loaded global time prediction model")
        
        # Load subreddit models
        for filename in os.listdir(load_path):
            if filename.startswith('time_prediction_') and filename.endswith('.pkl'):
                subreddit = filename.replace('time_prediction_', '').replace('.pkl', '')
                if subreddit != 'global':
                    model_path = os.path.join(load_path, filename)
                    model_data = joblib.load(model_path)
                    self.subreddit_models[subreddit] = model_data['model']
        
        print(f"✅ Loaded {len(self.subreddit_models)} subreddit models")


def train_time_prediction_system():
    """
    Main function to train the complete time prediction system
    """
    print("🚀 Starting Time Prediction System Training...")
    
    # Initialize engine
    engine = TimePredictionEngine()
    
    # Load and consolidate data
    df = engine.load_and_consolidate_data()
    if df.empty:
        print("❌ No data available for training")
        return None
    
    # Engineer features
    df = engine.engineer_time_features(df)
    
    # Create targets
    df = engine.create_optimal_time_targets(df)
    
    # Train models
    models = engine.train_time_prediction_models(df)
    
    # Save models
    engine.save_models()
    
    print("🎉 Time Prediction System Training Complete!")
    return engine


if __name__ == "__main__":
    # Train the system
    engine = train_time_prediction_system()
    
    if engine:
        # Test prediction
        test_prediction = engine.predict_optimal_time(
            subreddit="funny",
            content_type="image",
            user_data={"title_length": 50}
        )
        print(f"🧪 Test prediction: {test_prediction}") 