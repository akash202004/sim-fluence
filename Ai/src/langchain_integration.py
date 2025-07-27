import os
import sys
from typing import Dict, List, Any, Optional
import json
from datetime import datetime

# LangChain imports
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langchain_core.output_parsers import JsonOutputParser, PydanticOutputParser
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import LLMChain
from langchain.agents import Tool, AgentExecutor, create_react_agent
from langchain.memory import ConversationBufferMemory
from langchain_core.tools import tool

# Add src to path for local imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

try:
    from predict import predict_likes
    from sentiment_analyzer import analyze_sentiment
except ImportError:
    print("Warning: Could not import local modules. Make sure src/ modules are available.")

# Pydantic models for structured output


class EngagementPrediction(BaseModel):
    """Structured engagement prediction output"""
    predicted_likes: float = Field(description="Predicted number of likes")
    predicted_comments: int = Field(description="Predicted number of comments")
    confidence_score: float = Field(
        description="Confidence in prediction (0-1)")
    engagement_category: str = Field(
        description="Category: low, medium, high, viral")


class ContentOptimization(BaseModel):
    """Structured content optimization output"""
    optimized_caption: str = Field(description="AI-optimized caption")
    key_improvements: List[str] = Field(
        description="List of key improvements made")
    hashtags: List[str] = Field(description="Recommended hashtags")
    posting_recommendations: Dict[str, str] = Field(
        description="When and how to post")


class SentimentAnalysis(BaseModel):
    """Structured sentiment analysis output"""
    sentiment: str = Field(
        description="Overall sentiment: positive, negative, neutral")
    confidence: float = Field(description="Confidence in sentiment analysis")
    emotional_tone: str = Field(description="Detected emotional tone")
    suggestions: List[str] = Field(description="Suggestions for improvement")


class SimFluenceLangChainAgent:
    """
    LangChain agent that combines custom ML model with Gemini AI
    """

    def __init__(self, google_api_key: str = None):
        # Initialize Gemini
        self.google_api_key = google_api_key or os.getenv('GOOGLE_API_KEY')
        if not self.google_api_key:
            raise ValueError(
                "Google API key is required. Set GOOGLE_API_KEY environment variable.")

        # Initialize Gemini model
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=self.google_api_key,
            temperature=0.7,
            convert_system_message_to_human=True
        )

        # Initialize memory for conversation context
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )

        # Create tools
        self.tools = self._create_tools()

        # Create agent
        self.agent = self._create_agent()

    def _create_tools(self) -> List[Tool]:
        """Create LangChain tools for the agent"""

        @tool
        def predict_engagement_tool(input_data: str) -> str:
            """
            Predict social media engagement using trained XGBoost model.
            Input should be JSON string with user and post data.
            """
            try:
                data = json.loads(input_data)
                prediction = predict_likes(data)

                # Categorize engagement
                if prediction < 10:
                    category = "low"
                elif prediction < 50:
                    category = "medium"
                elif prediction < 200:
                    category = "high"
                else:
                    category = "viral"

                # Use combined model for better predictions
                from combined_predict import predict_from_text
                
                # Create sample post data for combined prediction
                post_text = input_data.get('postText', 'Sample post content')
                user_data = {
                    'userFollowers': input_data.get('userFollowers', 1000),
                    'userFollowing': input_data.get('userFollowing', 500),
                    'userKarma': input_data.get('userKarma', 5000),
                    'accountAgeDays': input_data.get('accountAgeDays', 365),
                    'avgEngagementRate': input_data.get('avgEngagementRate', 0.05),
                    'avgLikes': input_data.get('avgLikes', 50),
                    'avgComments': input_data.get('avgComments', 10)
                }
                
                combined_result = predict_from_text(post_text, user_data)
                
                if combined_result:
                    return json.dumps({
                        "predicted_likes": combined_result['predicted_likes'],
                        "predicted_comments": combined_result['predicted_comments'],
                        "predicted_shares": combined_result['predicted_shares'],
                        "engagement_category": category,
                        "confidence_score": 0.85,
                        "model_info": combined_result['model_info']
                    })
                else:
                    # Fallback to original prediction
                    return json.dumps({
                        "predicted_likes": max(0, int(round(prediction))),
                        "predicted_comments": max(1, int(prediction * 0.1)),
                        "engagement_category": category,
                        "confidence_score": 0.85
                    })
            except Exception as e:
                return f"Error in engagement prediction: {str(e)}"

        @tool
        def analyze_sentiment_tool(text: str) -> str:
            """
            Analyze sentiment of text content using multiple techniques.
            """
            try:
                result = analyze_sentiment(text)
                return json.dumps(result)
            except Exception as e:
                return f"Error in sentiment analysis: {str(e)}"

        @tool
        def get_current_time_tool() -> str:
            """Get current date and time for posting recommendations."""
            now = datetime.now()
            return json.dumps({
                "current_time": now.isoformat(),
                "day_of_week": now.strftime("%A"),
                "hour": now.hour,
                "optimal_posting_time": "evening" if 18 <= now.hour <= 21 else "morning" if 6 <= now.hour <= 9 else "off-peak"
            })

        return [
            predict_engagement_tool,
            analyze_sentiment_tool,
            get_current_time_tool
        ]

    def _create_agent(self):
        """Create the LangChain agent with tools"""
        from langchain.agents import create_react_agent
        from langchain import hub

        # Get the prompt template
        prompt = hub.pull("hwchase17/react")

        # Create agent
        agent = create_react_agent(
            llm=self.llm,
            tools=self.tools,
            prompt=prompt
        )

        return AgentExecutor(
            agent=agent,
            tools=self.tools,
            memory=self.memory,
            verbose=True,
            handle_parsing_errors=True
        )

    def optimize_content_with_gemini(self, content: str, user_profile: Dict, optimization_goals: List[str]) -> Dict:
        """
        Use Gemini + custom model to optimize social media content
        """

        # Create system prompt for content optimization
        system_prompt = """You are an expert social media content optimizer for Reddit. 
        You have access to a trained machine learning model that predicts engagement based on user data and content features.
        
        Your goal is to:
        1. Analyze the provided content and user profile
        2. Use the engagement prediction tool to get baseline metrics
        3. Generate optimized content that will perform better
        4. Provide specific, actionable recommendations
        
        Always use the available tools to get data-driven insights before making recommendations.
        
        Optimization Goals: {goals}
        User Profile: {profile}
        """

        human_prompt = """
        Original Content: "{content}"
        
        Please optimize this content for maximum Reddit engagement. Use the prediction tools to:
        1. Get baseline engagement prediction for current content
        2. Analyze sentiment and emotional impact
        3. Generate an optimized version
        4. Predict engagement for the optimized version
        5. Provide specific improvement recommendations
        
        Return your analysis and optimized content with clear before/after comparisons.
        """

        # Format the prompts
        formatted_system = system_prompt.format(
            goals=", ".join(optimization_goals),
            profile=json.dumps(user_profile)
        )
        formatted_human = human_prompt.format(content=content)

        # Execute the agent
        try:
            result = self.agent.invoke({
                "input": f"System: {formatted_system}\n\nHuman: {formatted_human}"
            })

            return {
                "status": "success",
                "optimization_result": result["output"],
                "agent_steps": result.get("intermediate_steps", [])
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "fallback_optimization": self._fallback_optimization(content, user_profile)
            }

    def generate_caption_with_context(self, prompt: str, platform: str = "reddit", context: Dict = None) -> Dict:
        """
        Generate caption using Gemini with context from custom model
        """

        # Create prompt template
        caption_prompt = ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template(
                """You are an expert social media caption writer for {platform}. 
                Create engaging, authentic captions that drive maximum engagement.
                
                Platform Guidelines:
                - Reddit: Focus on discussion, community value, authenticity
                - Avoid overly promotional language
                - Encourage comments and interaction
                
                Context: {context}
                """
            ),
            HumanMessagePromptTemplate.from_template(
                "Create an engaging {platform} caption for: {prompt}"
            )
        ])

        # Create chain
        chain = LLMChain(
            llm=self.llm,
            prompt=caption_prompt,
            output_parser=PydanticOutputParser(
                pydantic_object=ContentOptimization)
        )

        try:
            result = chain.run(
                platform=platform,
                prompt=prompt,
                context=json.dumps(context or {})
            )

            return {
                "status": "success",
                "caption": result.optimized_caption,
                "improvements": result.key_improvements,
                "hashtags": result.hashtags,
                "posting_tips": result.posting_recommendations
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "fallback_caption": f"Sharing some thoughts about {prompt}. What do you think?"
            }

    def comprehensive_analysis(self, content: str, user_profile: Dict) -> Dict:
        """
        Perform comprehensive analysis combining all AI capabilities
        """

        analysis_prompt = """
        Perform a comprehensive social media content analysis using all available tools.
        
        Content: "{content}"
        User Profile: {profile}
        
        Steps to follow:
        1. Predict engagement metrics for the current content
        2. Analyze sentiment and emotional tone
        3. Get optimal posting time recommendations
        4. Generate an improved version of the content
        5. Predict engagement for the improved version
        6. Provide a detailed comparison and recommendations
        
        Return a structured analysis with clear insights and actionable recommendations.
        """

        try:
            result = self.agent.invoke({
                "input": analysis_prompt.format(
                    content=content,
                    profile=json.dumps(user_profile)
                )
            })

            return {
                "status": "success",
                "comprehensive_analysis": result["output"],
                "agent_reasoning": result.get("intermediate_steps", [])
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }

    def _fallback_optimization(self, content: str, user_profile: Dict) -> Dict:
        """Fallback optimization if agent fails"""
        return {
            "optimized_content": f"Enhanced: {content} - What are your thoughts on this?",
            "improvements": ["Added engagement question", "Maintained original message"],
            "confidence": 0.6
        }

# Convenience wrapper for easy integration


class GeminiXGBoostOptimizer:
    """
    Simple wrapper combining XGBoost predictions with Gemini optimization
    """

    def __init__(self, google_api_key: str = None):
        self.agent = SimFluenceLangChainAgent(google_api_key)

    def quick_optimize(self, content: str, user_karma: int = 1000, user_followers: int = 100) -> Dict:
        """Quick content optimization with minimal input"""

        user_profile = {
            "karma": user_karma,
            "followers": user_followers,
            "account_age_days": 365,
            "avg_engagement_rate": 0.05
        }

        return self.agent.optimize_content_with_gemini(
            content=content,
            user_profile=user_profile,
            optimization_goals=["engagement", "authenticity", "discussion"]
        )

    def smart_caption_generation(self, prompt: str, engagement_target: str = "medium") -> Dict:
        """Generate captions optimized for specific engagement targets"""

        context = {
            "engagement_target": engagement_target,
            "platform_best_practices": "reddit_discussion_focused",
            "optimization_level": "high"
        }

        return self.agent.generate_caption_with_context(
            prompt=prompt,
            platform="reddit",
            context=context
        )

    def predict_and_optimize(self, content: str, user_data: Dict) -> Dict:
        """Complete pipeline: predict current performance, then optimize"""

        return self.agent.comprehensive_analysis(content, user_data)

# Example usage functions


def demo_langchain_integration():
    """Demo function showing how to use the LangChain integration"""

    # Initialize (requires GOOGLE_API_KEY environment variable)
    optimizer = GeminiXGBoostOptimizer()

    # Example 1: Quick optimization
    result1 = optimizer.quick_optimize(
        content="Just took this amazing photo of the sunset",
        user_karma=4500,
        user_followers=1200
    )
    print("Quick Optimization Result:", result1)

    # Example 2: Smart caption generation
    result2 = optimizer.smart_caption_generation(
        prompt="A photo of my home-cooked meal",
        engagement_target="high"
    )
    print("Smart Caption Result:", result2)

    # Example 3: Complete analysis
    result3 = optimizer.predict_and_optimize(
        content="Check out this new app I've been working on",
        user_data={"karma": 3000, "followers": 800, "account_age_days": 500}
    )
    print("Complete Analysis Result:", result3)


if __name__ == "__main__":
    demo_langchain_integration()
