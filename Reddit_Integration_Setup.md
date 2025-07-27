# Reddit OAuth Integration Setup

This guide explains how to set up Reddit OAuth authentication and store user details in the database.

## Prerequisites

1. A Reddit Developer Account
2. PostgreSQL database (configured in Backend)
3. Environment variables configured

## Setup Steps

### 1. Reddit App Configuration

1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Fill in the following details:
   - **Name**: Sim-Fluence
   - **App Type**: Web app
   - **Description**: AI-powered social media influence analytics and simulation platform
   - **About URL**: https://your-domain.com/about
   - **Redirect URI**: 
     - Development: `http://localhost:3000/api/auth/callback/reddit`
     - Production: `https://your-domain.com/api/auth/callback/reddit`

4. Note down your Client ID and Client Secret

### 2. Environment Variables

#### Frontend (.env.local)
Create a `.env.local` file in the Frontend directory with:

```env
# Reddit OAuth Configuration
REDDIT_CLIENT_ID=your_reddit_client_id_here
REDDIT_CLIENT_SECRET=your_reddit_client_secret_here

# Backend API URL
BACKEND_URL=http://localhost:3001

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

#### Backend (.env)
Create a `.env` file in the Backend directory with:

```env
# Server Configuration
PORT=3001

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/simfluence"

# Environment
NODE_ENV=development
```

### 3. Database Migration

Run the database migration to add Reddit user fields:

```bash
cd Sim-Fluence/Backend
npx prisma migrate dev --name add_reddit_user_fields
```

### 4. Backend Setup

Ensure your backend is running on the correct port (default: 3001) and the database is accessible.

### 5. Testing the Integration

1. Start the Frontend development server:
   ```bash
   cd Sim-Fluence/Frontend
   npm run dev
   ```

2. Start the Backend server:
   ```bash
   cd Sim-Fluence/Backend
   npm run dev
   ```

3. Navigate to http://localhost:3000
4. Click "Login with Reddit"
5. Complete the OAuth flow
6. Check the database to verify user details are stored

## Database Schema

The User model now includes Reddit-specific fields:

```prisma
model User {
  id               String          @id @default(uuid())
  email            String          @unique
  name             String?
  profileImageUrl  String?         
  redditId         String?         @unique
  redditUsername   String?
  createdAt        DateTime        @default(now())
  simulations      Simulation[]

  @@index([email])
  @@index([id])
  @@index([redditId])
}
```

## API Endpoints

### Create or Find User
- **POST** `/api/v1/user/findOrCreate`
- **Body**: `{ name, email, profileImageUrl, redditId, redditUsername }`

### Get User by ID
- **GET** `/api/v1/user/:id`

### Get User by Reddit ID
- **GET** `/api/v1/user/reddit/:redditId`

## How It Works

1. When a user signs in with Reddit, NextAuth.js triggers the `signIn` callback
2. The callback sends user data to the backend API
3. The backend either creates a new user or updates an existing one
4. The user's database ID is stored in the session for future use
5. The user can now access protected routes and their data is persisted

## Troubleshooting

### Common Issues

1. **Database Connection Error**: Ensure your database is running and accessible
2. **Reddit OAuth Error**: Verify your Client ID and Secret are correct
3. **Backend Connection Error**: Check that the backend is running on the correct port
4. **Migration Errors**: Ensure your database schema is up to date
5. **TypeScript Errors**: Run `npx prisma generate` after schema changes

### Debug Steps

1. Check browser console for errors
2. Check backend logs for API errors
3. Verify environment variables are loaded correctly
4. Test database connection manually
5. Ensure Prisma client is regenerated after schema changes

## Security Notes

- Never commit `.env.local` files to version control
- Use strong, unique secrets for production
- Regularly rotate Reddit API credentials
- Implement proper error handling and logging
- Consider rate limiting for API endpoints 