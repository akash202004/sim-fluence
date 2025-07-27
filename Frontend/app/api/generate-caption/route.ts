import { NextRequest, NextResponse } from 'next/server';

interface CaptionResponse {
  caption: string;
  hashtags: string[];
  confidence: number;
  suggestions: string[];
  model_used: string;
  fallback_used: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, platform = 'reddit', tone = 'casual', length = 'medium', include_hashtags = false, target_audience = 'general' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    let result: CaptionResponse;
    let fallbackUsed = false;
    let modelUsed = 'local_ai_model';

    // First, try our own AI model
    try {
      console.log('Attempting to use local AI model for caption generation...');
      
      const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:5001';
      const localResponse = await fetch(`${AI_API_URL}/generate/caption`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          platform,
          tone,
          length,
          include_hashtags,
          target_audience
        }),
      });

      if (localResponse.ok) {
        const localData = await localResponse.json();
        console.log('Local AI model successful:', localData);
        
        result = {
          caption: localData.caption,
          hashtags: localData.hashtags || [],
          confidence: localData.confidence || 0.8,
          suggestions: localData.suggestions || [],
          model_used: 'local_ai_model',
          fallback_used: false
        };
      } else {
        throw new Error(`Local AI model failed with status: ${localResponse.status}`);
      }
    } catch (localError) {
      console.log('Local AI model failed, falling back to Groq:', localError);
      fallbackUsed = true;
      modelUsed = 'groq_llama3_8b';
      
      // Fallback to Groq
      try {
        const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
        const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

        if (!GROQ_API_KEY) {
          throw new Error('Groq API key not configured');
        }

        const systemPrompt = `You are a social media expert specializing in creating engaging captions and hashtag strategies. 
        You analyze content and provide:
        1. A compelling caption appropriate for the platform
        2. Relevant hashtags for better engagement (if requested)
        3. Suggestions to improve the caption
        
        Always respond in JSON format with the following structure:
        {
          "caption": "your caption here",
          "hashtags": ["#hashtag1", "#hashtag2"],
          "suggestions": ["suggestion1", "suggestion2"]
        }`;

        const userPrompt = `Generate a ${platform} caption for: "${prompt}"
        
        Platform: ${platform}
        Tone: ${tone}
        Length: ${length}
        Target Audience: ${target_audience}
        Include Hashtags: ${include_hashtags}
        
        Make it engaging and platform-appropriate.`;

        const groqResponse = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (!groqResponse.ok) {
          throw new Error(`Groq API error: ${groqResponse.status}`);
        }

        const groqData = await groqResponse.json();
        const aiContent = groqData.choices[0]?.message?.content;
        
        if (!aiContent) {
          throw new Error('No response content from Groq API');
        }

        // Parse the JSON response from Groq
        const parsedGroqResponse = JSON.parse(aiContent);
        
        result = {
          caption: parsedGroqResponse.caption,
          hashtags: parsedGroqResponse.hashtags || [],
          confidence: 0.85, // Groq confidence
          suggestions: parsedGroqResponse.suggestions || [],
          model_used: 'groq_llama3_8b',
          fallback_used: true
        };

        console.log('Groq fallback successful:', result);
      } catch (groqError) {
        console.error('Groq fallback also failed:', groqError);
        
        // Final fallback to template-based generation
        result = {
          caption: generateTemplateCaption(prompt, platform, tone),
          hashtags: generateDefaultHashtags(platform),
          confidence: 0.6,
          suggestions: [
            'Consider adding more specific details',
            'Try using emojis for engagement',
            'Ask a question to encourage comments'
          ],
          model_used: 'template_fallback',
          fallback_used: true
        };
      }
    }

    return NextResponse.json({
      ...result,
      success: true,
      message: fallbackUsed ? 
        `Local AI model failed, used ${modelUsed} as fallback` : 
        'Successfully generated using local AI model'
    });

  } catch (error) {
    console.error('Caption generation error:', error);
    return NextResponse.json({ 
      error: 'Caption generation failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Template-based fallback functions
function generateTemplateCaption(prompt: string, platform: string, tone: string): string {
  const templates = {
    reddit: {
      casual: [
        `Just wanted to share this ${prompt} with you all! What do you think?`,
        `Found this amazing ${prompt} today. Anyone else seen something like this?`,
        `Thought you'd appreciate this ${prompt}. Pretty cool, right?`
      ],
      professional: [
        `Sharing some insights about ${prompt} that might be valuable to the community.`,
        `Here's an interesting perspective on ${prompt} worth discussing.`,
        `Thought this ${prompt} content would contribute to our ongoing discussions.`
      ]
    },
    instagram: {
      casual: [
        `✨ ${prompt} vibes today! 📸 #life #moments`,
        `Loving this ${prompt} energy! 💫 What's inspiring you today?`,
        `Here's to ${prompt} and all the good vibes! 🌟`
      ],
      professional: [
        `Professional insight: ${prompt} showcases excellent craftsmanship.`,
        `Industry perspective on ${prompt} - quality speaks for itself.`,
        `Behind the scenes: ${prompt} represents dedication to excellence.`
      ]
    }
  };

  const platformTemplates = templates[platform as keyof typeof templates] || templates.reddit;
  const toneTemplates = platformTemplates[tone as keyof typeof platformTemplates] || platformTemplates.casual;
  
  return toneTemplates[Math.floor(Math.random() * toneTemplates.length)];
}

function generateDefaultHashtags(platform: string): string[] {
  const defaults = {
    reddit: [], // Reddit doesn't use hashtags
    instagram: ['#content', '#share', '#community'],
    twitter: ['#social', '#content', '#engagement'],
    linkedin: ['#professional', '#content', '#insights']
  };

  return defaults[platform as keyof typeof defaults] || [];
} 