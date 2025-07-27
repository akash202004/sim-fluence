const { RedditService } = require('./dist/services/redditService');

// Test script for Reddit service
async function testRedditService() {
  try {
    // This is a test - you would need a real access token
    const accessToken = process.env.REDDIT_ACCESS_TOKEN;
    
    if (!accessToken) {
      console.log('Please set REDDIT_ACCESS_TOKEN environment variable');
      console.log('You can get this by logging in with Reddit and checking the session');
      return;
    }

    const redditService = new RedditService(accessToken);
    
    // Test with a known Reddit username (replace with actual username)
    const testUsername = 'test_user'; // Replace with actual username
    
    console.log('Testing Reddit service...');
    console.log(`Fetching analytics for user: ${testUsername}`);
    
    const analytics = await redditService.getUserAnalytics(testUsername);
    
    console.log('Reddit Analytics Results:');
    console.log('========================');
    console.log(`Reddit ID: ${analytics.redditId}`);
    console.log(`Username: ${analytics.redditUsername}`);
    console.log(`Total Post Karma: ${analytics.totalPostKarma}`);
    console.log(`Comment Karma: ${analytics.commentKarma}`);
    console.log(`Total Karma: ${analytics.redditKarma}`);
    console.log(`Account Age (days): ${analytics.redditAccountAge}`);
    console.log(`Average Upvotes: ${analytics.averageUpvotes}`);
    console.log(`Average Comments: ${analytics.averageComments}`);
    console.log(`Total Posts: ${analytics.totalPosts}`);
    console.log(`Engagement Rate: ${analytics.engagementRate}`);
    console.log(`Verified: ${analytics.verified}`);
    
  } catch (error) {
    console.error('Error testing Reddit service:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testRedditService(); 