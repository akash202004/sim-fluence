#!/usr/bin/env python3
"""
Validation script for existing SimFluence AI model
Checks if the current model and data work properly
"""

import os
import sys
import pandas as pd

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))


def validate_model_files():
    """Check if required model files exist"""
    print("🔍 Validating Model Files...")

    required_files = [
        'models/likes_predictor.pkl',
        'data/simfluence_reddit_training.csv',
        'src/preprocess.py',
        'src/train_model.py',
        'src/predict.py'
    ]

    missing_files = []
    for file_path in required_files:
        full_path = os.path.join('..', file_path)
        if not os.path.exists(full_path):
            missing_files.append(file_path)
        else:
            print(f"   ✅ {file_path}")

    if missing_files:
        print(f"   ❌ Missing files: {missing_files}")
        return False

    return True


def validate_data_format():
    """Check if training data has the expected format"""
    print("\n📊 Validating Data Format...")

    try:
        csv_path = os.path.join('..', 'data', 'simfluence_reddit_training.csv')
        df = pd.read_csv(csv_path)

        print(f"   📈 Dataset shape: {df.shape}")
        print(f"   📋 Columns: {list(df.columns)}")

        # Check for required columns
        required_columns = [
            'receivedLikes', 'receivedComments', 'length', 'containsImage',
            'dayOfWeek', 'postTimeOfDay', 'topCommentSentiment'
        ]

        missing_cols = [
            col for col in required_columns if col not in df.columns]
        if missing_cols:
            print(f"   ❌ Missing columns: {missing_cols}")
            return False

        print("   ✅ All required columns present")

        # Check data types
        print(f"   📊 Sample data:")
        print(
            f"      Likes range: {df['receivedLikes'].min()} - {df['receivedLikes'].max()}")
        print(
            f"      Comments range: {df['receivedComments'].min()} - {df['receivedComments'].max()}")
        print(
            f"      Length range: {df['length'].min()} - {df['length'].max()}")

        return True

    except Exception as e:
        print(f"   ❌ Error reading data: {str(e)}")
        return False


def validate_preprocessing():
    """Test the preprocessing function"""
    print("\n⚙️ Validating Preprocessing...")

    try:
        from preprocess import load_and_preprocess_data

        csv_path = os.path.join('..', 'data', 'simfluence_reddit_training.csv')
        X_train, X_test, y_train, y_test, feature_columns = load_and_preprocess_data(
            csv_path)

        print(f"   📊 Training set shape: {X_train.shape}")
        print(f"   📊 Test set shape: {X_test.shape}")
        print(f"   🏷️ Number of features: {len(feature_columns)}")
        print(f"   📋 Feature columns: {feature_columns[:5]}..." if len(
            feature_columns) > 5 else f"   📋 Feature columns: {feature_columns}")

        # Check for any NaN values
        if X_train.isna().sum().sum() > 0:
            print(f"   ⚠️ Warning: NaN values found in training data")
        else:
            print("   ✅ No NaN values in training data")

        return True

    except Exception as e:
        print(f"   ❌ Error in preprocessing: {str(e)}")
        return False


def validate_model_loading():
    """Test model loading and prediction"""
    print("\n🤖 Validating Model Loading...")

    try:
        from predict import load_model, predict_likes

        # Test model loading
        model, feature_columns = load_model()
        print(f"   ✅ Model loaded successfully")
        print(f"   🏷️ Expected features: {len(feature_columns)}")

        # Test prediction with sample data
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
            "dayOfWeek_Monday": 0,
            "dayOfWeek_Tuesday": 0,
            "dayOfWeek_Wednesday": 0,
            "dayOfWeek_Thursday": 0,
            "dayOfWeek_Friday": 1,
            "dayOfWeek_Saturday": 0,
            "postTimeOfDay_Evening": 1,
            "postTimeOfDay_Morning": 0,
            "postTimeOfDay_Afternoon": 0,
            "topCommentSentiment_Neutral": 0,
            "topCommentSentiment_Positive": 1
        }

        prediction = predict_likes(sample_input)
        print(f"   🔮 Sample prediction: {prediction:.1f} likes")

        if 0 <= prediction <= 10000:  # Reasonable range
            print("   ✅ Prediction in reasonable range")
        else:
            print(f"   ⚠️ Warning: Prediction seems unusual: {prediction}")

        return True

    except Exception as e:
        print(f"   ❌ Error in model loading/prediction: {str(e)}")
        return False


def validate_training():
    """Test model training process"""
    print("\n🏋️ Validating Training Process...")

    try:
        # Import training function
        sys.path.append(os.path.join('..', 'src'))
        from train_model import train_and_save_model

        print("   ✅ Training module imported successfully")
        print("   💡 Note: Run 'python src/train_model.py' to retrain the model")

        return True

    except Exception as e:
        print(f"   ❌ Error in training validation: {str(e)}")
        return False


def main():
    """Run all validation tests"""
    print("🧪 SimFluence AI Model Validation")
    print("=" * 50)

    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    tests = [
        validate_model_files,
        validate_data_format,
        validate_preprocessing,
        validate_model_loading,
        validate_training
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"   ❌ Test failed with exception: {str(e)}")

    print("\n" + "=" * 50)
    print(f"🎯 Validation Results: {passed}/{total} tests passed")

    if passed == total:
        print("✅ All validations passed! Your AI model is ready to use.")
        print("\n🚀 Next steps:")
        print("   1. Start the AI API: python api/app.py")
        print("   2. Test the API: python test/test_api.py")
        print("   3. Integrate with your backend using the integration guide")
    else:
        print("❌ Some validations failed. Please check the errors above.")
        print("\n🔧 Troubleshooting:")
        print("   1. Make sure you have the training data in data/simfluence_reddit_training.csv")
        print("   2. Run 'python src/train_model.py' to train the model")
        print("   3. Install requirements: pip install -r requirements.txt")


if __name__ == "__main__":
    main()
