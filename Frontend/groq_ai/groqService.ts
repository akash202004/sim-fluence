interface GroqResponse {
  caption: string;
  hashtags: string[];
  engagement_tips: string[];
}

interface ImageAnalysisRequest {
  imageDescription: string;
  platform: 'instagram' | 'twitter' | 'reddit' | 'linkedin';
  targetAudience?: string;
  tone?: 'professional' | 'casual' | 'funny' | 'inspirational';
}

export class GroqService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || '';
    this.baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  }

  async generateCaptionAndHashtags(request: ImageAnalysisRequest): Promise<GroqResponse> {
    try {
      const prompt = this.buildPrompt(request);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            {
              role: 'system',
              content: `You are a social media expert specializing in creating engaging captions and hashtag strategies. 
              You analyze image descriptions and provide:
              1. A compelling single-line caption (max 125 characters)
              2. 5-8 relevant hashtags for better engagement
              3. 2-3 engagement tips specific to the platform and content
              
              Always respond in JSON format with the following structure:
              {
                "caption": "your caption here",
                "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
                "engagement_tips": ["tip1", "tip2", "tip3"]
              }`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response content from Groq API');
      }

      // Parse the JSON response
      const parsedResponse = JSON.parse(content);
      
      return {
        caption: parsedResponse.caption,
        hashtags: parsedResponse.hashtags,
        engagement_tips: parsedResponse.engagement_tips
      };

    } catch (error) {
      console.error('Error generating caption and hashtags:', error);
      throw new Error('Failed to generate caption and hashtags');
    }
  }

  private buildPrompt(request: ImageAnalysisRequest): string {
    const { imageDescription, platform, targetAudience, tone } = request;
    
    let prompt = `Analyze this image description: "${imageDescription}"
    
Platform: ${platform}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${tone ? `Desired Tone: ${tone}` : ''}

Please provide:
1. A compelling single-line caption (max 125 characters) that will drive engagement
2. 5-8 relevant hashtags that will help with discoverability and engagement
3. 2-3 specific engagement tips for this ${platform} post

Consider ${platform} best practices and current trends.`;

    return prompt;
  }

  async analyzeImageEngagement(imageDescription: string, platform: string): Promise<{
    engagement_score: number;
    virality_potential: string;
    best_posting_time: string;
    audience_recommendations: string[];
  }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            {
              role: 'system',
              content: `You are a social media analytics expert. Analyze the engagement potential of content and provide insights.`
            },
            {
              role: 'user',
              content: `Analyze this image description for ${platform} engagement: "${imageDescription}"
              
              Provide a JSON response with:
              {
                "engagement_score": number (1-10),
                "virality_potential": "low/medium/high",
                "best_posting_time": "recommended time",
                "audience_recommendations": ["recommendation1", "recommendation2"]
              }`
            }
          ],
          temperature: 0.5,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response content from Groq API');
      }

      return JSON.parse(content);

    } catch (error) {
      console.error('Error analyzing image engagement:', error);
      throw new Error('Failed to analyze image engagement');
    }
  }
}

export default GroqService; 