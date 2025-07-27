import axios from 'axios';

interface RedditUserData {
  id: string;
  name: string;
  total_karma: number;
  link_karma: number;
  comment_karma: number;
  created_utc: number;
  verified: boolean;
  subreddit?: {
    subscribers: number;
  };
}

interface RedditPost {
  id: string;
  title: string;
  score: number;
  num_comments: number;
  created_utc: number;
  subreddit: string;
}

interface RedditComment {
  id: string;
  body: string;
  score: number;
  created_utc: number;
  subreddit: string;
}

export class RedditService {
  private baseUrl = 'https://oauth.reddit.com';
  private userAgent = 'Sim-Fluence/1.0';

  constructor(private accessToken: string) {}

  /**
   * Fetch detailed user profile data from Reddit API
   */
  async getUserProfile(username: string): Promise<RedditUserData> {
    try {
      const response = await axios.get(`${this.baseUrl}/user/${username}/about`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'User-Agent': this.userAgent,
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching Reddit user profile:', error);
      throw new Error('Failed to fetch Reddit user profile');
    }
  }

  /**
   * Fetch user's recent posts to calculate average upvotes and comments
   */
  async getUserPosts(username: string, limit: number = 25): Promise<RedditPost[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/user/${username}/submitted`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'User-Agent': this.userAgent,
        },
        params: {
          limit,
          sort: 'new',
        },
      });

      return response.data.data.children.map((child: any) => child.data);
    } catch (error) {
      console.error('Error fetching Reddit user posts:', error);
      throw new Error('Failed to fetch Reddit user posts');
    }
  }

  /**
   * Fetch user's recent comments to calculate average comment karma
   */
  async getUserComments(username: string, limit: number = 25): Promise<RedditComment[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/user/${username}/comments`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'User-Agent': this.userAgent,
        },
        params: {
          limit,
          sort: 'new',
        },
      });

      return response.data.data.children.map((child: any) => child.data);
    } catch (error) {
      console.error('Error fetching Reddit user comments:', error);
      throw new Error('Failed to fetch Reddit user comments');
    }
  }

  /**
   * Calculate average upvotes from recent posts
   */
  calculateAverageUpvotes(posts: RedditPost[]): number {
    if (posts.length === 0) return 0;
    
    const totalUpvotes = posts.reduce((sum, post) => sum + post.score, 0);
    return Math.round(totalUpvotes / posts.length);
  }

  /**
   * Calculate average comments from recent posts
   */
  calculateAverageComments(posts: RedditPost[]): number {
    if (posts.length === 0) return 0;
    
    const totalComments = posts.reduce((sum, post) => sum + post.num_comments, 0);
    return Math.round(totalComments / posts.length);
  }

  /**
   * Calculate account age in days
   */
  calculateAccountAge(createdUtc: number): number {
    const now = Date.now() / 1000;
    return Math.floor((now - createdUtc) / (24 * 60 * 60));
  }

  /**
   * Get comprehensive user analytics
   */
  async getUserAnalytics(username: string) {
    try {
      // Fetch user profile
      const profile = await this.getUserProfile(username);
      
      // Fetch recent posts and comments
      const [posts, comments] = await Promise.all([
        this.getUserPosts(username),
        this.getUserComments(username),
      ]);

      // Calculate analytics
      const averageUpvotes = this.calculateAverageUpvotes(posts);
      const averageComments = this.calculateAverageComments(posts);
      const accountAge = this.calculateAccountAge(profile.created_utc);

      return {
        redditId: profile.id,
        redditUsername: profile.name,
        totalPostKarma: profile.link_karma,
        commentKarma: profile.comment_karma,
        redditKarma: profile.total_karma,
        redditAccountAge: accountAge,
        averageUpvotes,
        averageComments,
        verified: profile.verified,
        totalPosts: posts.length, // This is just recent posts, not total
        engagementRate: posts.length > 0 ? (averageUpvotes + averageComments) / posts.length : 0,
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw error;
    }
  }
} 