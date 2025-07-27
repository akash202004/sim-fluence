# Groq AI Integration

This folder contains the Groq AI integration for image analysis and caption generation in the Sim-Fluence platform.

## Features

### 🖼️ Image Analysis
- Upload images and provide descriptions
- AI-powered caption generation
- Hashtag recommendations for better engagement
- Platform-specific optimization (Instagram, Twitter, Reddit, LinkedIn)

### 📊 Engagement Analysis
- Engagement score prediction (1-10 scale)
- Virality potential assessment
- Best posting time recommendations
- Audience targeting suggestions

### 🎯 Platform Optimization
- Tailored captions for different social media platforms
- Tone customization (professional, casual, funny, inspirational)
- Target audience specification
- Engagement tips specific to each platform

## Components

### `groqService.ts`
The core service that handles communication with the Groq AI API.

**Key Methods:**
- `generateCaptionAndHashtags()` - Generates captions and hashtags
- `analyzeImageEngagement()` - Analyzes engagement potential

### `ImageAnalysisComponent.tsx`
The main React component for the image analysis interface.

**Features:**
- File upload with preview
- Form for image description and settings
- Real-time AI analysis
- Copy-to-clipboard functionality
- Error handling and loading states

### `useGroqAI.ts`
Custom React hook for managing Groq AI functionality.

**Returns:**
- `isLoading` - Loading state
- `error` - Error messages
- `groqResponse` - AI-generated captions and hashtags
- `engagementAnalysis` - Engagement analysis results
- `analyzeImage()` - Function to trigger analysis
- `resetAnalysis()` - Function to reset state
- `copyToClipboard()` - Function to copy text

## Setup

### 1. Environment Variables
Add your Groq API key to `.env.local`:

```env
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
```

### 2. Get Groq API Key
1. Visit [Groq Console](https://console.groq.com/)
2. Create an account or sign in
3. Generate an API key
4. Add the key to your environment variables

### 3. Usage
The component is integrated into the simulation page with a tab interface:

```tsx
import ImageAnalysisComponent from '@/groq_ai/ImageAnalysisComponent';

// Use in your component
<ImageAnalysisComponent />
```

## API Response Format

### Caption Generation Response
```json
{
  "caption": "Your AI-generated caption here",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "engagement_tips": ["Tip 1", "Tip 2", "Tip 3"]
}
```

### Engagement Analysis Response
```json
{
  "engagement_score": 8,
  "virality_potential": "high",
  "best_posting_time": "2-4 PM on weekdays",
  "audience_recommendations": ["Recommendation 1", "Recommendation 2"]
}
```

## Error Handling

The service includes comprehensive error handling:
- Network errors
- API rate limiting
- Invalid responses
- Missing API keys

## Rate Limiting

Groq API has rate limits. The service handles:
- Request throttling
- Error retry logic
- User-friendly error messages

## Security

- API keys are stored in environment variables
- No sensitive data is logged
- Requests are made over HTTPS
- Client-side validation for file uploads

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure `NEXT_PUBLIC_GROQ_API_KEY` is set correctly
2. **Network Error**: Check internet connection and Groq API status
3. **File Upload Error**: Ensure file is under 10MB and is an image
4. **Analysis Failure**: Check that image description is provided

### Debug Steps

1. Check browser console for errors
2. Verify API key in environment variables
3. Test with a simple image and description
4. Check Groq API status page

## Future Enhancements

- Image recognition using Groq's vision capabilities
- Batch processing for multiple images
- Historical analysis tracking
- A/B testing for different captions
- Integration with social media scheduling tools 