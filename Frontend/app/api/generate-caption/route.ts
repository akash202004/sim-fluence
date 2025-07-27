import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, platform, tone, captionType, description, photoCount, userId } = body;

    // Validate required fields
    if (!prompt || !platform || !tone || !captionType || !description || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Groq API configuration
    const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured. Please add NEXT_PUBLIC_GROQ_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    // Create the system prompt for Groq
    const systemPrompt = `You are a professional social media caption generator. Create engaging, platform-appropriate captions that match the specified tone and style. 

IMPORTANT: Return ONLY the caption text. Do not include any analysis, explanation, bullet points, or meta-commentary about the caption. Just provide the pure caption content.

Guidelines:
- Keep captions concise and engaging
- Use appropriate hashtags when relevant
- Match the platform's typical content style
- Follow the specified tone and caption type
- Consider the number of photos in the post
- Make captions authentic and relatable
- For descriptive captions, provide detailed explanations
- For one-line captions, keep them short and punchy
- For story captions, create narrative-style content
- For question captions, make them engaging and thought-provoking
- For quote captions, make them inspirational and shareable

Remember: Output only the caption text, nothing else.`;

    // Enhanced user prompt with specific instructions for each caption type
    const captionTypeInstructions = {
      'one-line': 'Create a short, punchy caption that captures attention immediately.',
      'descriptive': 'Create a detailed, descriptive caption that explains the photo content, context, and meaning.',
      'story': 'Create a narrative-style caption that tells a story about the photo or moment.',
      'question': 'Create an engaging question-based caption that encourages audience interaction.',
      'quote': 'Create an inspirational quote-style caption that is shareable and motivational.'
    };

    const enhancedPrompt = `${prompt}

Photo description: "${description}"
Platform: ${platform}
Tone: ${tone}
Caption type: ${captionType}
Number of photos: ${photoCount}

Specific instructions for ${captionType} caption:
${captionTypeInstructions[captionType as keyof typeof captionTypeInstructions]}

Generate ONLY the caption text that:
1. Matches the ${tone} tone
2. Uses the ${captionType} style with appropriate length and detail
3. Is appropriate for ${platform} platform
4. Relates to the photo description: "${description}"
5. Considers that there are ${photoCount} photo(s) in the post

Return only the caption content - no analysis, no explanation, no bullet points.`;

    // Call Groq API
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Using Llama 3.1 8B model
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: enhancedPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500, // Increased for more detailed captions
        top_p: 1,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate caption from Groq API' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedCaption = data.choices[0]?.message?.content?.trim();

    if (!generatedCaption) {
      return NextResponse.json(
        { error: 'No caption generated' },
        { status: 500 }
      );
    }

    // Store the caption in the backend database
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const saveResponse = await fetch(`${BACKEND_URL}/api/v1/caption`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          caption: generatedCaption,
          platform,
          tone,
          captionType,
          description,
          photoCount,
        }),
      });

      if (!saveResponse.ok) {
        console.error('Failed to save caption to database:', await saveResponse.text());
        // Still return the caption even if saving fails
      }
    } catch (error) {
      console.error('Error saving caption to database:', error);
      // Still return the caption even if saving fails
    }

    return NextResponse.json({
      caption: generatedCaption,
      platform,
      tone,
      captionType,
      photoCount,
    });

  } catch (error) {
    console.error('Caption generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 