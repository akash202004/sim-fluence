import NextAuth from "next-auth";
import RedditProvider from "next-auth/providers/reddit";

export const authOptions = {
  providers: [
    RedditProvider({
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
    }),
    // ...add more providers here
  ],
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/', // Error code passed in query string as ?error=
    verifyRequest: '/', // (used for check email message)
    newUser: '/simulation' // New users will be redirected here
  },
  callbacks: {
    async redirect({ baseUrl }) {
      // Always redirect to simulation page after successful login
      return `${baseUrl}/simulation`
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "reddit") {
        try {
          // Calculate account age in days
          const accountAge = profile?.created_utc 
            ? Math.floor((Date.now() / 1000 - profile.created_utc) / (24 * 60 * 60))
            : null;

          // Store user details in database with social media analytics
          const response = await fetch(`${process.env.BACKEND_URL}/api/v1/user/findOrCreate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: user.name || profile?.name,
              email: user.email || `${user.id}@reddit.com`,
              profileImageUrl: user.image,
              redditId: user.id,
              redditUsername: profile?.name,
              // Reddit-specific analytics data
              redditKarma: profile?.total_karma || 0,
              redditAccountAge: accountAge,
              totalPostKarma: profile?.link_karma || 0,
              commentKarma: profile?.comment_karma || 0,
              averageUpvotes: profile?.upvote_ratio ? Math.round(profile.upvote_ratio * 100) : 0,
              averageComments: 0, // Will be updated with detailed analytics
              engagementRate: 0.0, // Will be calculated based on actual engagement
              totalPosts: profile?.num_posts || 0,
              verified: profile?.verified || false,
            }),
          });

          if (!response.ok) {
            console.error('Failed to store user in database:', await response.text());
            return false;
          }

          const userData = await response.json();
          user.databaseId = userData.id;

          // After storing basic user data, fetch detailed Reddit analytics
          if (account?.access_token && userData.id) {
            try {
              const analyticsResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/user/${userData.id}/reddit-analytics`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  accessToken: account.access_token,
                }),
              });

              if (analyticsResponse.ok) {
                console.log('Detailed Reddit analytics updated successfully');
              } else {
                console.error('Failed to update detailed Reddit analytics:', await analyticsResponse.text());
              }
            } catch (analyticsError) {
              console.error('Error updating detailed Reddit analytics:', analyticsError);
            }
          }

          return true;
        } catch (error) {
          console.error('Error storing user in database:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user?.databaseId) {
        token.databaseId = user.databaseId;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken;
      session.databaseId = token.databaseId;
      return session;
    },
  },
};

export default NextAuth(authOptions);