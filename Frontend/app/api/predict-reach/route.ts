import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export async function POST(request: NextRequest) {
  // Get user session
  const session = await getServerSession(authOptions);
  const userId = session?.databaseId || null;

  // Parse multipart form data
  const formData = await request.formData();
  const images = formData.getAll('images'); // Array of File
  const caption = formData.get('caption');
  const hashtags = formData.get('hashtags');

  // Fetch user data from backend
  let userData = null;
  if (userId) {
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const userRes = await fetch(`${BACKEND_URL}/api/v1/user/${userId}`);
      if (userRes.ok) {
        userData = await userRes.json();
        console.log('Fetched user data:', userData);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  }

  // Groq AI configuration
  const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: 'Groq API key not configured.' }, { status: 500 });
  }

  // Test Groq API connection first
  console.log('Testing Groq API connection...');
  try {
    const testRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'user', content: 'Respond with just "OK" to test the connection.' },
        ],
        temperature: 0.1,
        max_tokens: 10,
      }),
    });
    console.log('Groq API test response status:', testRes.status);
    if (!testRes.ok) {
      const errorText = await testRes.text();
      console.error('Groq API test failed:', errorText);
    } else {
      const testData = await testRes.json();
      console.log('Groq API test successful:', testData.choices[0]?.message?.content);
    }
  } catch (err) {
    console.error('Groq API test error:', err);
  }

  // Build enhanced prompt with user data
  const systemPrompt = `You are a social media analytics expert. Analyze the given Reddit post and user profile data to predict engagement metrics and provide feedback. You MUST respond with ONLY valid JSON containing two keys: "prediction" and "feedback". The prediction should include: upvotes, karma, downvotes, comments, shares. The feedback should include: suggestedHashtags (array), captionTips (string), overall (string).`;

  let userPrompt = `Analyze this Reddit post:
Caption: ${caption}
Hashtags: ${hashtags}
Images: ${images.length}`;
  
  if (userData) {
    userPrompt += `\n\nUser Profile Data:
- Reddit Karma: ${userData.redditKarma || 0}
- Account Age: ${userData.redditAccountAge || 0} days
- Total Post Karma: ${userData.totalPostKarma || 0}
- Comment Karma: ${userData.commentKarma || 0}
- Average Upvotes: ${userData.averageUpvotes || 0}
- Total Posts: ${userData.totalPosts || 0}
- Engagement Rate: ${userData.engagementRate || 0}
- Verified: ${userData.verified || false}`;
  } else {
    userPrompt += '\n\nUser Profile Data: New account (limited data available)';
  }

  userPrompt += `\n\nRespond with ONLY valid JSON like this:
{
  "prediction": {
    "upvotes": 150,
    "karma": 200,
    "downvotes": 10,
    "comments": 25,
    "shares": 5
  },
  "feedback": {
    "suggestedHashtags": ["#Reddit", "#Community"],
    "captionTips": "Try asking a question to increase engagement",
    "overall": "Good post! Consider adding more hashtags"
  }
}`;

  // Call Groq AI
  let prediction = null;
  let feedback = null;
  try {
    const groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
        stream: false,
      }),
    });
    if (!groqRes.ok) throw new Error('Groq AI error');
    const groqData = await groqRes.json();
    const aiContent = groqData.choices[0]?.message?.content;
    console.log('Groq AI Response:', aiContent);
    // Try to parse JSON from AI response
    const aiJson = aiContent && aiContent.trim().startsWith('{') ? JSON.parse(aiContent) : null;
    console.log('Parsed AI JSON:', aiJson);
    prediction = aiJson?.prediction || null;
    feedback = aiJson?.feedback || null;
    console.log('Extracted prediction:', prediction);
    console.log('Extracted feedback:', feedback);
  } catch (err) {
    console.error('Groq AI Error:', err);
    // Fallback to mock if Groq fails
    prediction = {
      upvotes: 123,
      karma: 456,
      downvotes: 7,
      comments: 12,
      shares: 3,
    };
    feedback = {
      suggestedHashtags: ['#AI', '#SocialMedia'],
      captionTips: 'Try making your caption more engaging by asking a question.',
      overall: 'Great start! Consider adding trending hashtags for more reach.'
    };
  }

  // Ensure we always have prediction and feedback
  if (!prediction || !feedback) {
    console.log('Using fallback prediction due to missing data');
    prediction = {
      upvotes: userData?.redditKarma ? Math.floor(userData.redditKarma * 0.1) : 50,
      karma: userData?.redditKarma || 100,
      downvotes: 5,
      comments: userData?.averageComments || 8,
      shares: 2,
    };
    feedback = {
      suggestedHashtags: ['#Reddit', '#Community'],
      captionTips: 'Try asking a question or sharing a personal story to increase engagement.',
      overall: userData ? 'Based on your Reddit activity, this post should perform well!' : 'Keep posting to improve your predictions!'
    };
  }

  // Store in backend DB
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  const content = JSON.stringify({ caption, hashtags, prediction, feedback, userData });
  const status = 'COMPLETED';
  const platform = 'REDDIT';

  console.log('Saving to backend with userId:', userId);
  console.log('Backend payload:', { userId, content, status, platform });

  let backendResult = null;
  try {
    const saveRes = await fetch(`${BACKEND_URL}/api/v1/simulation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        content,
        status,
        platform,
      }),
    });
    backendResult = await saveRes.json();
    console.log('Backend save result:', backendResult);
  } catch (err) {
    console.error('Backend save error:', err);
    return NextResponse.json({ error: 'Failed to save prediction to backend', details: String(err) }, { status: 500 });
  }

  console.log('Final response:', { userId, prediction, feedback, backendResult });
  return NextResponse.json({
    userId,
    prediction,
    feedback,
    backendResult,
    userData, // Include user data in response for debugging
  });
} 