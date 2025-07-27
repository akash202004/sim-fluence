import os
from typing import Dict, List
import random


def generate_caption(
    prompt: str,
    platform: str = "reddit",
    tone: str = "casual",
    length: str = "medium",
    include_hashtags: bool = False,
    target_audience: str = "general"
) -> Dict:
    """
    Generate AI-powered captions for social media posts

    Args:
        prompt: Description of the content
        platform: Target platform (reddit, instagram, twitter, etc.)
        tone: Tone of the caption (casual, professional, funny, etc.)
        length: Length preference (short, medium, long)
        include_hashtags: Whether to include hashtags
        target_audience: Target audience description

    Returns:
        Dict with caption, hashtags, confidence, and suggestions
    """

    try:
        # Build the system prompt based on parameters
        system_prompt = build_system_prompt(
            platform, tone, length, target_audience)

        # Use template-based generation (OpenAI integration removed)
        generated_caption = generate_template_caption(
            prompt, platform, tone)

        # Extract hashtags if requested
        hashtags = []
        if include_hashtags:
            hashtags = extract_or_generate_hashtags(prompt, platform)

        # Generate suggestions for improvement
        suggestions = generate_caption_suggestions(generated_caption, platform)

        return {
            "caption": generated_caption,
            "hashtags": hashtags,
            "confidence": 0.85,
            "suggestions": suggestions
        }

    except Exception as e:
        print(f"Error in caption generation: {str(e)}")
        # Fallback to template-based generation
        return {
            "caption": generate_template_caption(prompt, platform, tone),
            "hashtags": generate_default_hashtags(platform),
            "confidence": 0.6,
            "suggestions": ["Consider adding more specific details", "Try using emojis for engagement"]
        }


def build_system_prompt(platform: str, tone: str, length: str, target_audience: str) -> str:
    """Build system prompt for AI caption generation"""

    platform_guidelines = {
        "reddit": "Create engaging, discussion-worthy content that adds value to the community. Avoid overly promotional language.",
        "instagram": "Create visually appealing, lifestyle-focused content with emojis and hashtags.",
        "twitter": "Create concise, witty content under 280 characters that encourages retweets.",
        "linkedin": "Create professional, industry-relevant content that showcases expertise.",
        "facebook": "Create community-focused, shareable content that encourages comments."
    }

    tone_guidelines = {
        "casual": "Use informal, friendly language that feels conversational and approachable.",
        "professional": "Use formal, authoritative language appropriate for business contexts.",
        "funny": "Use humor, wit, and playful language to entertain the audience.",
        "inspirational": "Use motivational, uplifting language that inspires action.",
        "educational": "Use clear, informative language that teaches or explains concepts."
    }

    length_guidelines = {
        "short": "Keep it concise - under 50 words.",
        "medium": "Moderate length - 50-100 words.",
        "long": "Detailed content - 100-200 words."
    }

    return f"""
    You are an expert social media content creator specializing in {platform} posts.
    
    Platform Guidelines: {platform_guidelines.get(platform, platform_guidelines['reddit'])}
    Tone: {tone_guidelines.get(tone, tone_guidelines['casual'])}
    Length: {length_guidelines.get(length, length_guidelines['medium'])}
    Target Audience: {target_audience}
    
    Create engaging, platform-appropriate content that maximizes engagement and fits the specified tone and length.
    """


def generate_template_caption(prompt: str, platform: str, tone: str) -> str:
    """Fallback template-based caption generation"""

    templates = {
        "reddit": {
            "casual": [
                f"Just wanted to share this {prompt} with you all! What do you think?",
                f"Found this amazing {prompt} today. Anyone else seen something like this?",
                f"Thought you'd appreciate this {prompt}. Pretty cool, right?"
            ],
            "professional": [
                f"Sharing some insights about {prompt} that might be valuable to the community.",
                f"Here's an interesting perspective on {prompt} worth discussing.",
                f"Thought this {prompt} content would contribute to our ongoing discussions."
            ]
        },
        "instagram": {
            "casual": [
                f"✨ {prompt} vibes today! 📸 #life #moments",
                f"Loving this {prompt} energy! 💫 What's inspiring you today?",
                f"Here's to {prompt} and all the good vibes! 🌟"
            ],
            "professional": [
                f"Professional insight: {prompt} showcases excellent craftsmanship.",
                f"Industry perspective on {prompt} - quality speaks for itself.",
                f"Behind the scenes: {prompt} represents dedication to excellence."
            ]
        }
    }

    platform_templates = templates.get(platform, templates["reddit"])
    tone_templates = platform_templates.get(tone, platform_templates["casual"])

    return random.choice(tone_templates)


def extract_or_generate_hashtags(prompt: str, platform: str) -> List[str]:
    """Generate relevant hashtags based on content"""

    # Common hashtags by platform
    platform_hashtags = {
        "instagram": ["#instagood", "#photooftheday", "#beautiful", "#happy", "#life"],
        "twitter": ["#trending", "#viral", "#thoughts", "#share", "#community"],
        "linkedin": ["#professional", "#industry", "#insights", "#business", "#growth"]
    }

    # Extract keywords from prompt for custom hashtags
    keywords = prompt.lower().split()
    custom_hashtags = [f"#{word}" for word in keywords if len(word) > 3][:3]

    # Combine platform-specific and custom hashtags
    base_hashtags = platform_hashtags.get(
        platform, platform_hashtags["instagram"])

    return custom_hashtags + base_hashtags[:3]


def generate_default_hashtags(platform: str) -> List[str]:
    """Generate default hashtags for platform"""
    defaults = {
        "reddit": [],  # Reddit doesn't use hashtags
        "instagram": ["#content", "#share", "#community"],
        "twitter": ["#social", "#content", "#engagement"],
        "linkedin": ["#professional", "#content", "#insights"]
    }

    return defaults.get(platform, [])


def generate_caption_suggestions(caption: str, platform: str) -> List[str]:
    """Generate suggestions to improve the caption"""

    suggestions = []

    # Check caption length
    if len(caption) < 20:
        suggestions.append(
            "Consider adding more detail to increase engagement")
    elif len(caption) > 200 and platform == "twitter":
        suggestions.append(
            "Caption might be too long for Twitter - consider shortening")

    # Check for emojis (Instagram/casual platforms)
    if platform in ["instagram", "facebook"] and "emoji" not in caption.lower():
        suggestions.append(
            "Consider adding emojis to make the post more visually appealing")

    # Check for questions (engagement)
    if "?" not in caption:
        suggestions.append(
            "Add a question to encourage comments and engagement")

    # Platform-specific suggestions
    if platform == "reddit":
        suggestions.append(
            "Consider starting with 'TIL' or 'Discussion' for better community engagement")
    elif platform == "linkedin":
        suggestions.append(
            "Include industry-relevant keywords for better professional reach")

    return suggestions[:3]  # Limit to top 3 suggestions

# Alternative: Local model integration using Ollama


def generate_caption_with_ollama(prompt: str, platform: str = "reddit") -> str:
    """
    Generate caption using local Ollama model (if available)
    Requires: pip install ollama-python
    """
    try:
        import ollama

        response = ollama.chat(model='llama2', messages=[
            {
                'role': 'user',
                'content': f'Generate a {platform} caption for: {prompt}. Make it engaging and platform-appropriate.'
            }
        ])

        return response['message']['content']
    except ImportError:
        return generate_template_caption(prompt, platform, "casual")
    except Exception as e:
        print(f"Ollama generation failed: {e}")
        return generate_template_caption(prompt, platform, "casual")
