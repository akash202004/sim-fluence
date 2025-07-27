# Reddit Analytics Integration

This document describes the Reddit analytics integration that stores detailed user data when users log in with their Reddit accounts.

## Features

When a user logs in with their Reddit account, the system now stores:

### Basic Reddit Data
- **Reddit ID**: Unique identifier from Reddit
- **Reddit Username**: User's Reddit username
- **Account Age**: Number of days since account creation
- **Verified Status**: Whether the account is verified

### Karma Breakdown
- **Total Post Karma**: Total karma from link submissions
- **Comment Karma**: Total karma from comments
- **Total Karma**: Combined karma from posts and comments

### Engagement Analytics
- **Average Upvotes**: Average upvotes on recent posts (last 25 posts)
- **Average Comments**: Average comments received on recent posts
- **Engagement Rate**: Calculated engagement metric
- **Total Posts**: Number of recent posts analyzed

## Database Schema

The User model has been optimized for Reddit-specific data:

```prisma
model User {
  id               String          @id @default(uuid())
  email            String          @unique
  name             String?
  profileImageUrl  String?         
  redditId         String?         @unique
  redditUsername   String?
  createdAt        DateTime        @default(now())
  
  // Reddit-specific analytics data
  redditKarma      Int?            @default(0)
  redditAccountAge  Int?           // in days
  totalPostKarma   Int?            @default(0)
  commentKarma     Int?            @default(0)
  averageUpvotes   Int?            @default(0)
  averageComments  Int?            @default(0)
  engagementRate   Float?          @default(0.0)
  totalPosts       Int?            @default(0)
  verified         Boolean         @default(false)
  lastActive       DateTime?
  
  simulations      Simulation[]
}
```

## API Endpoints

### 1. Find or Create User
- **POST** `/api/v1/user/findOrCreate`
- Stores basic user information during login

### 2. Update Reddit Analytics
- **PUT** `/api/v1/user/:id/reddit-analytics`
- Fetches detailed Reddit data and updates user analytics
- Requires Reddit access token

## Implementation Flow

1. **User Login**: User clicks "Login with Reddit"
2. **OAuth Flow**: NextAuth.js handles Reddit OAuth
3. **Basic Storage**: Basic user data is stored in database
4. **Detailed Analytics**: RedditService fetches detailed analytics
5. **Database Update**: User record is updated with comprehensive data

## RedditService

The `RedditService` class provides methods to:

- Fetch user profile data
- Get recent posts and comments
- Calculate average upvotes and comments
- Compute account age and engagement metrics

### Usage Example

```typescript
const redditService = new RedditService(accessToken);
const analytics = await redditService.getUserAnalytics(username);
```

## Environment Variables

Ensure these environment variables are set:

```env
# Frontend
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
BACKEND_URL=http://localhost:3001

# Backend
DATABASE_URL=your_database_url
```

## Error Handling

The system includes comprehensive error handling:

- Network errors when fetching Reddit data
- Database connection issues
- Invalid access tokens
- Missing user data

## Rate Limiting

Reddit API has rate limits. The service:
- Fetches only recent posts (last 25)
- Uses proper User-Agent headers
- Handles rate limit errors gracefully

## Testing

To test the integration:

1. Start both frontend and backend servers
2. Navigate to the login page
3. Click "Login with Reddit"
4. Complete the OAuth flow
5. Check the database for stored user data
6. Verify detailed analytics are populated

## Troubleshooting

### Common Issues

1. **Reddit API Errors**: Check access token validity
2. **Database Errors**: Ensure schema is up to date
3. **Network Errors**: Verify backend URL configuration
4. **TypeScript Errors**: Run `npx prisma generate` after schema changes

### Debug Steps

1. Check browser console for OAuth errors
2. Monitor backend logs for API errors
3. Verify database migrations are applied
4. Test Reddit API access manually

## Security Considerations

- Access tokens are not stored in the database
- User data is encrypted in transit
- Reddit credentials are kept secure
- API calls use proper authentication headers 