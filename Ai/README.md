# 🤖 SimFluence AI API

A comprehensive AI-powered API that serves your custom machine learning model for social media engagement prediction, plus additional services for content optimization.

## 🌟 Features

- **📈 Engagement Prediction**: Predict likes and comments using your trained XGBoost model
- **✍️ AI Caption Generation**: Generate engaging captions using local models and templates
- **💭 Sentiment Analysis**: Analyze content sentiment for optimization
- **🔧 Complete Post Optimization**: Combined AI services for maximum engagement
- **🚀 Easy Integration**: Simple REST API with Python client SDK

## 🏗️ Architecture

```
SimFluence AI API
├── Custom ML Model (XGBoost)     # Your trained engagement predictor
├── Caption Generation            # Local templates and models
├── Sentiment Analysis           # TextBlob + VADER + Custom rules
└── Post Optimization           # Combined AI pipeline
```

## 🚀 Quick Start

### 1. Installation

```bash
cd Ai
pip install -r requirements.txt
python -m textblob.download_corpora
```

### 2. Environment Setup

```bash
cp .env.template .env
# Edit .env with your API keys
```

### 3. Train Model (if needed)

```bash
python src/train_model.py
```

### 4. Start API

```bash
# Linux/Mac
./start_api.sh

# Windows
start_api.bat

# Manual
python api/app.py
```

API runs on `http://localhost:5001`

## 📡 API Endpoints

### Health Check

```http
GET /health
```

### Engagement Prediction

```http
POST /predict/engagement
Content-Type: application/json

{
  "length": 35,
  "containsImage": 1,
  "userFollowers": 1200,
  "userKarma": 4500,
  "accountAgeDays": 700,
  "avgEngagementRate": 0.06,
  "dayOfWeek": "Friday",
  "postTimeOfDay": "Evening"
}
```

**Response:**

```json
{
  "predicted_likes": 127.3,
  "predicted_comments": 14,
  "engagement_score": 7.2,
  "status": "success"
}
```

### Caption Generation

```http
POST /generate/caption
Content-Type: application/json

{
  "prompt": "Amazing sunset photo from my vacation",
  "platform": "reddit",
  "tone": "casual",
  "length": "medium",
  "include_hashtags": false
}
```

**Response:**

```json
{
  "caption": "Just captured this incredible sunset during my vacation! The colors were absolutely breathtaking. Sometimes nature puts on the most amazing shows.",
  "hashtags": [],
  "confidence": 0.85,
  "suggestions": ["Consider adding a question to encourage engagement"],
  "status": "success"
}
```

### Sentiment Analysis

```http
POST /analyze/sentiment
Content-Type: application/json

{
  "text": "This is absolutely amazing!"
}
```

**Response:**

```json
{
  "sentiment": "positive",
  "confidence": 0.87,
  "scores": {
    "polarity": 0.75,
    "subjectivity": 0.8,
    "positive_score": 0.9,
    "negative_score": 0.0,
    "neutral_score": 0.1
  },
  "status": "success"
}
```

### Complete Post Optimization

```http
POST /optimize/post
Content-Type: application/json

{
  "content": "Check out this cool photo I took",
  "user_data": {
    "userKarma": 4500,
    "userFollowers": 1200
  },
  "post_settings": {
    "containsImage": true,
    "dayOfWeek": "Friday"
  },
  "optimization_goals": ["engagement", "caption", "sentiment"]
}
```

## 🐍 Python Client SDK

```python
from src.ai_client import SimFluenceAI

# Initialize client
ai = SimFluenceAI()

# Quick engagement prediction
result = ai.quick_engagement_prediction(
    user_karma=4500,
    user_followers=1200,
    content="Amazing new technology discovery!",
    has_image=True
)
print(f"Predicted likes: {result['predicted_likes']}")

# Generate optimized caption
caption = ai.quick_caption_generation(
    "A beautiful sunset photo",
    platform="reddit"
)
print(f"Generated caption: {caption}")

# Check sentiment
sentiment = ai.quick_sentiment_check("I love this new feature!")
print(f"Sentiment: {sentiment}")

# Complete optimization
optimization = ai.smart_post_optimization(
    content="My latest project showcase",
    user_profile={
        "karma": 4500,
        "followers": 1200,
        "engagement_rate": 0.06
    }
)
```

## 🔧 Backend Integration

### TypeScript Service

```typescript
// Backend/src/services/aiService.ts
import axios from "axios";

class AIService {
  private baseURL = process.env.AI_API_URL || "http://localhost:5001";

  async predictEngagement(userData: any, postData: any) {
    const response = await axios.post(`${this.baseURL}/predict/engagement`, {
      length: postData.content.length,
      containsImage: postData.containsImage ? 1 : 0,
      userFollowers: userData.followers,
      userKarma: userData.karma,
      // ... other parameters
    });
    return response.data;
  }

  async generateCaption(prompt: string) {
    const response = await axios.post(`${this.baseURL}/generate/caption`, {
      prompt,
      platform: "reddit",
      tone: "casual",
    });
    return response.data;
  }
}

export default new AIService();
```

### Usage in Controller

```typescript
// Backend/src/controllers/simulationController.ts
import AIService from "../services/aiService";

export const runSimulation = async (req: Request, res: Response) => {
  const { content, username } = req.body;

  // Get user data from Reddit
  const userData = await redditService.getUserProfile(username);

  // Get AI predictions
  const engagement = await AIService.predictEngagement(userData, {
    content,
    containsImage: req.body.hasImage,
  });

  const optimizedCaption = await AIService.generateCaption(content);

  res.json({
    predictions: engagement,
    optimized_content: optimizedCaption.caption,
    suggestions: optimizedCaption.suggestions,
  });
};
```

## 🎯 Model Features

Your XGBoost model uses these features for prediction:

- **User Metrics**: karma, followers, account age, engagement history
- **Content Features**: length, contains image, improvement flag
- **Temporal Features**: day of week, time of day
- **Engagement Context**: average likes/comments, engagement rate
- **Sentiment**: top comment sentiment (positive/neutral/negative)

## 📊 Model Performance

- **Training Data**: Reddit posts with engagement metrics
- **Algorithm**: XGBoost Regression
- **Features**: ~15-20 engineered features
- **Validation**: 80/20 train/test split
- **Metrics**: Mean Squared Error (MSE) tracking

## 🔄 Extending the API

### Adding New Models

```python
# src/new_model.py
def load_new_model():
    return joblib.load('models/new_model.pkl')

def predict_new_metric(input_data):
    model = load_new_model()
    return model.predict(input_data)
```

### Adding New Endpoints

```python
# api/app.py
@app.route('/predict/new-metric', methods=['POST'])
def predict_new_metric():
    data = request.get_json()
    result = predict_new_metric(data)
    return jsonify({"prediction": result})
```

## 🐳 Docker Deployment

```bash
# Build image
docker build -t simfluence-ai .

# Run container
docker run -p 5001:5001 -e OPENAI_API_KEY=your_key simfluence-ai
```

## 🧪 Testing

```bash
# Run API tests
python test/test_api.py

# Test specific endpoint
curl -X POST http://localhost:5001/health
```

## 🔐 Security Features

- **CORS enabled** for frontend integration
- **Request validation** for all endpoints
- **Error handling** with proper HTTP status codes
- **Environment variable** support for secrets
- **Rate limiting** ready (Redis integration)

## 📈 Monitoring

- **Health checks** at `/health`
- **Logging** to `logs/ai_api.log`
- **Performance metrics** for each prediction
- **Error tracking** with detailed stack traces

## 🚀 Production Deployment

1. **Set environment variables**:

   ```env
   OPENAI_API_KEY=your_key
   AI_API_URL=https://your-domain.com/ai
   DEBUG=False
   ```

2. **Use process manager**:

   ```bash
   # With PM2
   pm2 start api/app.py --name "simfluence-ai"

   # With systemd
   sudo systemctl start simfluence-ai
   ```

3. **Set up reverse proxy** (nginx):
   ```nginx
   location /ai/ {
       proxy_pass http://localhost:5001/;
       proxy_set_header Host $host;
   }
   ```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-model`
3. Add your changes
4. Test: `python test/test_api.py`
5. Submit pull request

## 📝 License

MIT License - see LICENSE file for details.

---

**🎯 Your AI API is now ready to power intelligent social media content optimization!**

The API combines your custom-trained engagement prediction model with modern AI services to give users:

- Accurate engagement predictions based on real data
- AI-generated content suggestions
- Sentiment-based optimization recommendations
- Complete post optimization pipeline

This creates a much more intelligent and useful simulation experience for your users! 🚀
