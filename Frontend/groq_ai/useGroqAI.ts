import { useState } from 'react';
import GroqService from './groqService';

interface GroqResponse {
  caption: string;
  hashtags: string[];
  engagement_tips: string[];
}

interface EngagementAnalysis {
  engagement_score: number;
  virality_potential: string;
  best_posting_time: string;
  audience_recommendations: string[];
}

interface ImageAnalysisRequest {
  imageDescription: string;
  platform: 'instagram' | 'twitter' | 'reddit' | 'linkedin';
  targetAudience?: string;
  tone?: 'professional' | 'casual' | 'funny' | 'inspirational';
}

export const useGroqAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groqResponse, setGroqResponse] = useState<GroqResponse | null>(null);
  const [engagementAnalysis, setEngagementAnalysis] = useState<EngagementAnalysis | null>(null);

  const analyzeImage = async (request: ImageAnalysisRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const groqService = new GroqService();
      
      // Generate caption and hashtags
      const captionResponse = await groqService.generateCaptionAndHashtags(request);
      setGroqResponse(captionResponse);

      // Analyze engagement potential
      const engagementResponse = await groqService.analyzeImageEngagement(
        request.imageDescription, 
        request.platform
      );
      setEngagementAnalysis(engagementResponse);

      return {
        caption: captionResponse,
        engagement: engagementResponse
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setGroqResponse(null);
    setEngagementAnalysis(null);
    setError(null);
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  };

  return {
    isLoading,
    error,
    groqResponse,
    engagementAnalysis,
    analyzeImage,
    resetAnalysis,
    copyToClipboard,
  };
}; 