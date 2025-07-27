const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export interface UserData {
  id: string;
  name?: string;
  email: string;
  profileImageUrl?: string;
  redditId?: string;
  redditUsername?: string;
  createdAt: string;
  // Social media analytics
  followers?: number;
  following?: number;
  averagePostImpressions?: number;
  totalPosts?: number;
  engagementRate?: number;
  averageLikes?: number;
  averageComments?: number;
  averageShares?: number;
  accountAge?: number;
  lastActive?: string;
  verified?: boolean;
  redditKarma?: number;
  redditAccountAge?: number;
}

export interface UserAnalytics {
  followers?: number;
  following?: number;
  averagePostImpressions?: number;
  totalPosts?: number;
  engagementRate?: number;
  averageLikes?: number;
  averageComments?: number;
  averageShares?: number;
  accountAge?: number;
  redditKarma?: number;
  redditAccountAge?: number;
  verified?: boolean;
}

export const api = {
  async findOrCreateUser(userData: {
    name?: string;
    email: string;
    profileImageUrl?: string;
    redditId?: string;
    redditUsername?: string;
    followers?: number;
    following?: number;
    averagePostImpressions?: number;
    totalPosts?: number;
    engagementRate?: number;
    averageLikes?: number;
    averageComments?: number;
    averageShares?: number;
    accountAge?: number;
    redditKarma?: number;
    redditAccountAge?: number;
    verified?: boolean;
  }): Promise<UserData> {
    const response = await fetch(`${BACKEND_URL}/api/v1/user/findOrCreate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to create or find user');
    }

    return response.json();
  },

  async getUserById(id: string): Promise<UserData> {
    const response = await fetch(`${BACKEND_URL}/api/v1/user/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return response.json();
  },

  async getUserByRedditId(redditId: string): Promise<UserData> {
    const response = await fetch(`${BACKEND_URL}/api/v1/user/reddit/${redditId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch user by Reddit ID');
    }

    return response.json();
  },

  async updateUserAnalytics(userId: string, analytics: UserAnalytics): Promise<UserData> {
    const response = await fetch(`${BACKEND_URL}/api/v1/user/${userId}/analytics`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analytics),
    });

    if (!response.ok) {
      throw new Error('Failed to update user analytics');
    }

    return response.json();
  },

  async getLeaderboard(params?: {
    sortBy?: string;
    order?: 'asc' | 'desc';
    limit?: number;
  }): Promise<UserData[]> {
    const searchParams = new URLSearchParams();
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.order) searchParams.append('order', params.order);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`${BACKEND_URL}/api/v1/user/analytics/leaderboard?${searchParams}`);

    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }

    return response.json();
  },

  // Helper function to calculate engagement rate
  calculateEngagementRate(likes: number, comments: number, shares: number, followers: number): number {
    if (followers === 0) return 0;
    return ((likes + comments + shares) / followers) * 100;
  },

  // Helper function to format numbers for display
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },
}; 