import pandas as pd
from sklearn.model_selection import train_test_split

def load_and_preprocess_data(csv_path: str):
    # Load dataset
    df = pd.read_csv(csv_path)

    # Convert boolean to int
    df['containsImage'] = df['containsImage'].astype(int)
    df['shouldImprove'] = df['shouldImprove'].astype(int)

    # One-hot encode categorical features
    df = pd.get_dummies(df, columns=[
        'dayOfWeek', 'postTimeOfDay', 'topCommentSentiment'
    ], drop_first=True)

    # Define feature and label columns
    feature_columns = df.drop([
        'receivedLikes', 'receivedComments', 'receivedShares',
        'suggestions', 'postText', 'hashtags'
    ], axis=1).columns.tolist()

    return df, feature_columns
