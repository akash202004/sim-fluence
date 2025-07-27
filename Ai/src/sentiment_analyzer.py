from textblob import TextBlob
import re
from typing import Dict, List
import numpy as np


def analyze_sentiment(text: str) -> Dict:
    """
    Analyze sentiment of text using TextBlob and rule-based analysis

    Args:
        text: Text to analyze

    Returns:
        Dict with sentiment, confidence, and detailed scores
    """

    try:
        # Use TextBlob for basic sentiment analysis
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity  # -1 (negative) to 1 (positive)
        # 0 (objective) to 1 (subjective)
        subjectivity = blob.sentiment.subjectivity

        # Determine sentiment category
        if polarity > 0.1:
            sentiment = "positive"
        elif polarity < -0.1:
            sentiment = "negative"
        else:
            sentiment = "neutral"

        # Calculate confidence based on polarity strength
        confidence = min(abs(polarity) + 0.3, 1.0)

        # Enhanced analysis with keyword detection
        enhanced_scores = analyze_sentiment_keywords(text)

        # Combine TextBlob and keyword analysis
        final_sentiment = combine_sentiment_scores(
            sentiment, enhanced_scores, polarity)

        return {
            "sentiment": final_sentiment,
            "confidence": round(confidence, 2),
            "scores": {
                "polarity": round(polarity, 2),
                "subjectivity": round(subjectivity, 2),
                "positive_score": enhanced_scores["positive"],
                "negative_score": enhanced_scores["negative"],
                "neutral_score": enhanced_scores["neutral"]
            },
            "keywords": enhanced_scores["keywords"]
        }

    except Exception as e:
        print(f"Error in sentiment analysis: {str(e)}")
        # Fallback to basic rule-based analysis
        return analyze_sentiment_fallback(text)


def analyze_sentiment_keywords(text: str) -> Dict:
    """Enhanced sentiment analysis using keyword detection"""

    # Positive keywords
    positive_keywords = [
        "amazing", "awesome", "great", "love", "best", "excellent", "fantastic",
        "wonderful", "perfect", "incredible", "outstanding", "brilliant", "good",
        "happy", "excited", "thrilled", "delighted", "pleased", "satisfied",
        "recommend", "impressed", "quality", "beautiful", "helpful", "useful"
    ]

    # Negative keywords
    negative_keywords = [
        "terrible", "awful", "hate", "worst", "bad", "horrible", "disappointing",
        "frustrated", "angry", "sad", "upset", "annoyed", "disgusted", "poor",
        "useless", "waste", "broken", "problem", "issue", "fail", "wrong",
        "difficult", "hard", "struggle", "concerned", "worried", "disappointed"
    ]

    # Neutral keywords
    neutral_keywords = [
        "okay", "fine", "average", "normal", "standard", "regular", "typical",
        "basic", "simple", "plain", "ordinary", "common", "usual", "so-so"
    ]

    text_lower = text.lower()

    # Count keyword occurrences
    positive_count = sum(1 for word in positive_keywords if word in text_lower)
    negative_count = sum(1 for word in negative_keywords if word in text_lower)
    neutral_count = sum(1 for word in neutral_keywords if word in text_lower)

    total_sentiment_words = positive_count + negative_count + neutral_count

    if total_sentiment_words == 0:
        return {
            "positive": 0.33,
            "negative": 0.33,
            "neutral": 0.34,
            "keywords": []
        }

    # Calculate normalized scores
    positive_score = positive_count / total_sentiment_words
    negative_score = negative_count / total_sentiment_words
    neutral_score = neutral_count / total_sentiment_words

    # Find detected keywords
    detected_keywords = []
    for word in positive_keywords:
        if word in text_lower:
            detected_keywords.append({"word": word, "sentiment": "positive"})
    for word in negative_keywords:
        if word in text_lower:
            detected_keywords.append({"word": word, "sentiment": "negative"})
    for word in neutral_keywords:
        if word in text_lower:
            detected_keywords.append({"word": word, "sentiment": "neutral"})

    return {
        "positive": round(positive_score, 2),
        "negative": round(negative_score, 2),
        "neutral": round(neutral_score, 2),
        "keywords": detected_keywords
    }


def combine_sentiment_scores(textblob_sentiment: str, keyword_scores: Dict, polarity: float) -> str:
    """Combine TextBlob and keyword-based sentiment analysis"""

    # Give more weight to TextBlob if polarity is strong
    if abs(polarity) > 0.5:
        return textblob_sentiment

    # Use keyword analysis for weak polarity cases
    max_score = max(
        keyword_scores["positive"], keyword_scores["negative"], keyword_scores["neutral"])

    if keyword_scores["positive"] == max_score and max_score > 0.4:
        return "positive"
    elif keyword_scores["negative"] == max_score and max_score > 0.4:
        return "negative"
    else:
        return "neutral"


def analyze_sentiment_fallback(text: str) -> Dict:
    """Fallback sentiment analysis using basic rules"""

    positive_words = ["good", "great", "love",
                      "amazing", "awesome", "best", "excellent"]
    negative_words = ["bad", "hate", "terrible",
                      "awful", "worst", "horrible", "disappointing"]

    text_lower = text.lower()

    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)

    if positive_count > negative_count:
        sentiment = "positive"
        confidence = min(positive_count * 0.3 + 0.4, 1.0)
    elif negative_count > positive_count:
        sentiment = "negative"
        confidence = min(negative_count * 0.3 + 0.4, 1.0)
    else:
        sentiment = "neutral"
        confidence = 0.5

    return {
        "sentiment": sentiment,
        "confidence": round(confidence, 2),
        "scores": {
            "polarity": 0.1 if sentiment == "positive" else -0.1 if sentiment == "negative" else 0,
            "subjectivity": 0.5,
            "positive_score": positive_count * 0.2,
            "negative_score": negative_count * 0.2,
            "neutral_score": 0.6
        },
        "keywords": []
    }


def analyze_emotion(text: str) -> Dict:
    """
    Analyze emotions in text beyond just sentiment

    Returns: Dict with emotion categories and scores
    """

    emotion_keywords = {
        "joy": ["happy", "excited", "thrilled", "delighted", "cheerful", "ecstatic"],
        "anger": ["angry", "furious", "mad", "irritated", "annoyed", "frustrated"],
        "sadness": ["sad", "depressed", "upset", "disappointed", "gloomy", "melancholy"],
        "fear": ["scared", "afraid", "worried", "anxious", "nervous", "terrified"],
        "surprise": ["surprised", "amazed", "shocked", "astonished", "stunned"],
        "disgust": ["disgusted", "revolted", "repulsed", "sick", "nauseated"]
    }

    text_lower = text.lower()
    emotion_scores = {}

    for emotion, keywords in emotion_keywords.items():
        count = sum(1 for word in keywords if word in text_lower)
        emotion_scores[emotion] = count

    # Normalize scores
    total_emotions = sum(emotion_scores.values())
    if total_emotions > 0:
        emotion_scores = {k: round(v / total_emotions, 2)
                          for k, v in emotion_scores.items()}
    else:
        emotion_scores = {k: 0 for k in emotion_keywords.keys()}

    # Find dominant emotion
    dominant_emotion = max(emotion_scores.items(), key=lambda x: x[1])

    return {
        "dominant_emotion": dominant_emotion[0] if dominant_emotion[1] > 0 else "neutral",
        "emotion_scores": emotion_scores,
        "confidence": dominant_emotion[1]
    }


def get_sentiment_suggestions(sentiment: str, confidence: float) -> List[str]:
    """Generate suggestions based on sentiment analysis"""

    suggestions = []

    if sentiment == "negative" and confidence > 0.7:
        suggestions.extend([
            "Consider rephrasing with more positive language",
            "Add constructive elements to balance the negativity",
            "Include solutions or improvements to make content more helpful"
        ])
    elif sentiment == "neutral" and confidence > 0.6:
        suggestions.extend([
            "Add more emotional words to create stronger engagement",
            "Include personal experiences to make content more relatable",
            "Use power words to increase impact"
        ])
    elif sentiment == "positive" and confidence < 0.5:
        suggestions.extend([
            "Strengthen positive language for better impact",
            "Add specific examples to support positive claims",
            "Use more enthusiastic language"
        ])

    return suggestions

# Alternative: Using VADER sentiment (more suitable for social media)


def analyze_sentiment_vader(text: str) -> Dict:
    """
    Analyze sentiment using VADER (Valence Aware Dictionary and sEntiment Reasoner)
    Better for social media content with slang, emoticons, etc.
    Requires: pip install vaderSentiment
    """
    try:
        from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

        analyzer = SentimentIntensityAnalyzer()
        scores = analyzer.polarity_scores(text)

        # Determine overall sentiment
        if scores['compound'] >= 0.05:
            sentiment = 'positive'
        elif scores['compound'] <= -0.05:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'

        return {
            "sentiment": sentiment,
            "confidence": abs(scores['compound']),
            "scores": {
                "positive": scores['pos'],
                "negative": scores['neg'],
                "neutral": scores['neu'],
                "compound": scores['compound']
            }
        }

    except ImportError:
        # Fallback to TextBlob if VADER not available
        return analyze_sentiment(text)
