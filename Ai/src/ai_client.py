import requests
import json
from typing import Dict, List, Optional
import os


class SimFluenceAIClient:
    """
    Client SDK for SimFluence AI API
    Easy integration with backend services
    """

    def __init__(self, base_url: str = "http://localhost:5001", api_key: Optional[str] = None):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()

        if api_key:
            self.session.headers.update({"Authorization": f"Bearer {api_key}"})

        self.session.headers.update({
            "Content-Type": "application/json",
            "User-Agent": "SimFluence-AI-Client/1.0"
        })

    def health_check(self) -> Dict:
        """Check if the AI API is healthy"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"status": "unhealthy", "error": str(e)}

    def predict_engagement(self,
                           user_data: Dict,
                           post_data: Dict,
                           content: str = "") -> Dict:
        """
        Predict engagement for a post

        Args:
            user_data: User statistics (karma, followers, etc.)
            post_data: Post settings (timing, image, etc.)
            content: Post content for length calculation

        Returns:
            Dict with predicted likes, comments, and engagement score
        """

        payload = {
            "length": len(content) if content else post_data.get("length", 0),
            "containsImage": 1 if post_data.get("containsImage", False) else 0,
            "userFollowers": user_data.get("userFollowers", 0),
            "userKarma": user_data.get("userKarma", 0),
            "accountAgeDays": user_data.get("accountAgeDays", 365),
            "avgEngagementRate": user_data.get("avgEngagementRate", 0.05),
            "avgLikes": user_data.get("avgLikes", 10),
            "avgComments": user_data.get("avgComments", 2),
            "dayOfWeek": post_data.get("dayOfWeek", "Friday"),
            "postTimeOfDay": post_data.get("postTimeOfDay", "Evening"),
            "topCommentSentiment": post_data.get("topCommentSentiment", "Positive")
        }

        try:
            response = self.session.post(f"{self.base_url}/predict/engagement",
                                         json=payload)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": f"Prediction failed: {str(e)}", "status": "error"}

    def generate_caption(self,
                         prompt: str,
                         platform: str = "reddit",
                         tone: str = "casual",
                         length: str = "medium",
                         include_hashtags: bool = False,
                         target_audience: str = "general") -> Dict:
        """
        Generate AI-powered caption for social media post

        Args:
            prompt: Description of the content
            platform: Target platform
            tone: Tone of the caption
            length: Length preference
            include_hashtags: Whether to include hashtags
            target_audience: Target audience description

        Returns:
            Dict with generated caption, hashtags, and suggestions
        """

        payload = {
            "prompt": prompt,
            "platform": platform,
            "tone": tone,
            "length": length,
            "include_hashtags": include_hashtags,
            "target_audience": target_audience
        }

        try:
            response = self.session.post(f"{self.base_url}/generate/caption",
                                         json=payload)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": f"Caption generation failed: {str(e)}", "status": "error"}

    def analyze_sentiment(self, text: str) -> Dict:
        """
        Analyze sentiment of text content

        Args:
            text: Text to analyze

        Returns:
            Dict with sentiment analysis results
        """

        payload = {"text": text}

        try:
            response = self.session.post(f"{self.base_url}/analyze/sentiment",
                                         json=payload)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": f"Sentiment analysis failed: {str(e)}", "status": "error"}

    def optimize_post(self,
                      content: str,
                      user_data: Dict,
                      post_settings: Dict,
                      optimization_goals: List[str] = None) -> Dict:
        """
        Complete post optimization using all AI services

        Args:
            content: Post content
            user_data: User statistics
            post_settings: Post configuration
            optimization_goals: List of goals (engagement, caption, sentiment)

        Returns:
            Dict with optimization results and recommendations
        """

        if optimization_goals is None:
            optimization_goals = ["engagement", "caption", "sentiment"]

        payload = {
            "content": content,
            "user_data": user_data,
            "post_settings": post_settings,
            "optimization_goals": optimization_goals
        }

        try:
            response = self.session.post(f"{self.base_url}/optimize/post",
                                         json=payload)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": f"Post optimization failed: {str(e)}", "status": "error"}

    def gemini_optimize_content(self,
                                content: str,
                                user_profile: Dict,
                                optimization_goals: List[str] = None) -> Dict:
        """
        Advanced content optimization using Gemini + XGBoost

        Args:
            content: Post content
            user_profile: User statistics and profile data
            optimization_goals: List of optimization goals

        Returns:
            Dict with advanced optimization results
        """

        if optimization_goals is None:
            optimization_goals = ["engagement", "authenticity", "discussion"]

        payload = {
            "content": content,
            "user_profile": user_profile,
            "optimization_goals": optimization_goals
        }

        try:
            response = self.session.post(f"{self.base_url}/ai/gemini/optimize",
                                         json=payload)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": f"Gemini optimization failed: {str(e)}", "status": "error"}

    def gemini_generate_caption(self,
                                prompt: str,
                                platform: str = "reddit",
                                engagement_target: str = "medium",
                                context: Dict = None) -> Dict:
        """
        Advanced caption generation using Gemini with context

        Args:
            prompt: Description of the content
            platform: Target platform
            engagement_target: Desired engagement level
            context: Additional context for generation

        Returns:
            Dict with contextual caption generation results
        """

        payload = {
            "prompt": prompt,
            "platform": platform,
            "engagement_target": engagement_target,
            "context": context or {}
        }

        try:
            response = self.session.post(f"{self.base_url}/ai/gemini/caption",
                                         json=payload)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": f"Gemini caption generation failed: {str(e)}", "status": "error"}

    def comprehensive_ai_analysis(self,
                                  content: str,
                                  user_data: Dict,
                                  analysis_depth: str = "full") -> Dict:
        """
        Complete AI analysis using LangChain agent with multiple tools

        Args:
            content: Post content
            user_data: User statistics
            analysis_depth: 'full' or 'quick'

        Returns:
            Dict with comprehensive analysis results
        """

        payload = {
            "content": content,
            "user_data": user_data,
            "analysis_depth": analysis_depth
        }

        try:
            response = self.session.post(f"{self.base_url}/ai/comprehensive",
                                         json=payload)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": f"Comprehensive analysis failed: {str(e)}", "status": "error"}

    def get_ai_models_status(self) -> Dict:
        """Get status of all AI models and integrations"""
        try:
            response = self.session.get(f"{self.base_url}/ai/models/status")
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": f"Status check failed: {str(e)}", "status": "error"}

# Convenience functions for quick integration


class SimFluenceAI:
    """Simple wrapper for common AI operations"""

    def __init__(self, ai_api_url: str = None):
        self.client = SimFluenceAIClient(
            base_url=ai_api_url or os.getenv(
                'AI_API_URL', 'http://localhost:5001')
        )

    def quick_engagement_prediction(self,
                                    user_karma: int,
                                    user_followers: int,
                                    content: str,
                                    has_image: bool = False) -> Dict:
        """Quick engagement prediction with minimal input"""

        user_data = {
            "userKarma": user_karma,
            "userFollowers": user_followers,
            "avgEngagementRate": 0.05,
            "avgLikes": max(10, user_karma // 100),
            "avgComments": max(2, user_karma // 500)
        }

        post_data = {
            "containsImage": has_image,
            "dayOfWeek": "Friday",
            "postTimeOfDay": "Evening"
        }

        return self.client.predict_engagement(user_data, post_data, content)

    def quick_caption_generation(self, prompt: str, platform: str = "reddit") -> str:
        """Quick caption generation returning just the caption text"""

        result = self.client.generate_caption(prompt, platform=platform)

        if result.get("status") == "success":
            return result.get("caption", prompt)
        else:
            return prompt  # Fallback to original prompt

    def quick_sentiment_check(self, text: str) -> str:
        """Quick sentiment check returning just the sentiment"""

        result = self.client.analyze_sentiment(text)

        if result.get("status") == "success":
            return result.get("sentiment", "neutral")
        else:
            return "neutral"  # Fallback

    def smart_post_optimization(self, content: str, user_profile: Dict) -> Dict:
        """Smart optimization with recommended settings"""

        user_data = {
            "userKarma": user_profile.get("karma", 1000),
            "userFollowers": user_profile.get("followers", 100),
            "accountAgeDays": user_profile.get("account_age_days", 365),
            "avgEngagementRate": user_profile.get("engagement_rate", 0.05),
            "avgLikes": user_profile.get("avg_likes", 15),
            "avgComments": user_profile.get("avg_comments", 3)
        }

        post_settings = {
            "containsImage": "image" in content.lower() or "photo" in content.lower(),
            "dayOfWeek": "Friday",  # Best day for engagement
            "postTimeOfDay": "Evening"  # Best time for engagement
        }

        return self.client.optimize_post(
            content=content,
            user_data=user_data,
            post_settings=post_settings,
            optimization_goals=["engagement", "caption", "sentiment"]
        )

    def gemini_smart_optimization(self, content: str, user_profile: Dict, use_advanced: bool = True) -> Dict:
        """
        Smart optimization using Gemini AI + XGBoost model

        Args:
            content: Post content
            user_profile: User profile data
            use_advanced: Whether to use advanced Gemini optimization

        Returns:
            Dict with advanced optimization results
        """

        if use_advanced:
            # Use advanced Gemini optimization
            result = self.client.gemini_optimize_content(
                content=content,
                user_profile=user_profile,
                optimization_goals=["engagement", "authenticity", "discussion"]
            )

            if result.get("status") == "success":
                return result["optimization_result"]

        # Fallback to regular optimization
        return self.client.optimize_post(
            content=content,
            user_data=user_profile,
            post_settings={"containsImage": "image" in content.lower()},
            optimization_goals=["engagement", "caption", "sentiment"]
        )

    def gemini_caption_with_context(self, prompt: str, user_context: Dict = None, target: str = "high") -> str:
        """
        Generate contextual caption using Gemini

        Args:
            prompt: Content description
            user_context: User context for personalization
            target: Engagement target level

        Returns:
            Generated caption string
        """

        result = self.client.gemini_generate_caption(
            prompt=prompt,
            platform="reddit",
            engagement_target=target,
            context={"user_data": user_context} if user_context else None
        )

        if result.get("status") == "success":
            caption_result = result.get("caption_result", {})
            return caption_result.get("caption", prompt)
        else:
            # Fallback to regular caption generation
            return self.quick_caption_generation(prompt, "reddit")

    def ai_content_advisor(self, content: str, user_profile: Dict) -> Dict:
        """
        Comprehensive AI content advisory using all available models

        Args:
            content: Post content
            user_profile: User profile data

        Returns:
            Dict with comprehensive analysis and recommendations
        """

        # Try comprehensive AI analysis first
        result = self.client.comprehensive_ai_analysis(
            content=content,
            user_data=user_profile,
            analysis_depth="full"
        )

        if result.get("status") == "success":
            return result["analysis_result"]

        # Fallback to regular optimization
        return self.smart_post_optimization(content, user_profile)

    def check_ai_capabilities(self) -> Dict:
        """Check what AI capabilities are currently available"""

        status = self.client.get_ai_models_status()

        if status.get("status") != "error":
            models_status = status.get("models_status", {})
            return {
                "xgboost_available": models_status.get("xgboost_model", {}).get("available", False),
                "gemini_available": models_status.get("gemini_api", {}).get("configured", False),
                "langchain_available": models_status.get("langchain_integration", {}).get("available", False),
                "recommended_mode": "gemini" if models_status.get("gemini_api", {}).get("configured") else "standard"
            }

        return {"error": "Could not check AI capabilities", "recommended_mode": "standard"}

# Example usage for backend integration


def integrate_with_backend_service(content: str, user_data: Dict) -> Dict:
    """
    Example function showing how to integrate AI predictions with your backend
    This can be called from your Backend/src/controllers/simulationController.ts
    """

    ai = SimFluenceAI()

    # Get engagement prediction
    engagement = ai.quick_engagement_prediction(
        user_karma=user_data.get("karma", 1000),
        user_followers=user_data.get("followers", 100),
        content=content,
        has_image=user_data.get("has_image", False)
    )

    # Generate optimized caption
    caption = ai.quick_caption_generation(content, platform="reddit")

    # Analyze sentiment
    sentiment = ai.quick_sentiment_check(content)

    return {
        "original_content": content,
        "optimized_caption": caption,
        "predicted_engagement": engagement,
        "sentiment_analysis": sentiment,
        "ai_confidence": engagement.get("engagement_score", 0)
    }
