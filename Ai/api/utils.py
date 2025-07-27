def transform_input_features(data):
    """Transform user-friendly input to model-ready features"""
    transformed = {
        "length": data.get("length", 0),
        "containsImage": data.get("containsImage", 0),
        "userFollowers": data.get("userFollowers", 0),
        "userKarma": data.get("userKarma", 0),
        "accountAgeDays": data.get("accountAgeDays", 365),
        "avgEngagementRate": data.get("avgEngagementRate", 0.05),
        "avgLikes": data.get("avgLikes", 10),
        "avgComments": data.get("avgComments", 2),
        "shouldImprove": 0,
    }
    # One-hot encode day of week
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day = data.get("dayOfWeek", "Friday")
    for d in days[:-1]:  # Drop Sunday as reference
        transformed[f"dayOfWeek_{d}"] = 1 if day == d else 0
    # One-hot encode time of day
    times = ["Morning", "Afternoon", "Evening", "Night"]
    time = data.get("postTimeOfDay", "Evening")
    for t in times[:-1]:  # Drop Night as reference
        transformed[f"postTimeOfDay_{t}"] = 1 if time == t else 0
    # One-hot encode sentiment
    sentiments = ["Negative", "Neutral", "Positive"]
    sentiment = data.get("topCommentSentiment", "Positive")
    for s in sentiments[1:]:  # Drop Negative as reference
        transformed[f"topCommentSentiment_{s}"] = 1 if sentiment == s else 0
    return transformed

def generate_optimization_recommendations(results):
    """Generate actionable recommendations based on AI analysis"""
    recommendations = []
    if 'engagement_prediction' in results:
        engagement = results['engagement_prediction']
        if engagement['engagement_score'] < 3:
            recommendations.append(
                "Consider posting at peak hours (evening) for better engagement")
            recommendations.append("Add an image to increase visual appeal")
        if engagement['predicted_likes'] < 50:
            recommendations.append(
                "Try using trending hashtags relevant to your content")
            recommendations.append(
                "Engage with your audience in comments to boost interaction")
    if 'sentiment_analysis' in results:
        sentiment = results['sentiment_analysis']
        if sentiment['sentiment'] == 'negative':
            recommendations.append(
                "Consider rephrasing content with more positive language")
        elif sentiment['sentiment'] == 'neutral':
            recommendations.append(
                "Add more emotional words to create stronger engagement")
    if 'optimized_caption' in results:
        recommendations.append(
            "Use the AI-generated caption for better performance")
    return recommendations 