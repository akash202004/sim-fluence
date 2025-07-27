"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedditService = void 0;
const axios_1 = __importDefault(require("axios"));
class RedditService {
    constructor(accessToken) {
        this.accessToken = accessToken;
        this.baseUrl = 'https://oauth.reddit.com';
        this.userAgent = 'Sim-Fluence/1.0';
    }
    /**
     * Fetch detailed user profile data from Reddit API
     */
    getUserProfile(username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${this.baseUrl}/user/${username}/about`, {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'User-Agent': this.userAgent,
                    },
                });
                return response.data.data;
            }
            catch (error) {
                console.error('Error fetching Reddit user profile:', error);
                throw new Error('Failed to fetch Reddit user profile');
            }
        });
    }
    /**
     * Fetch user's recent posts to calculate average upvotes and comments
     */
    getUserPosts(username_1) {
        return __awaiter(this, arguments, void 0, function* (username, limit = 25) {
            try {
                const response = yield axios_1.default.get(`${this.baseUrl}/user/${username}/submitted`, {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'User-Agent': this.userAgent,
                    },
                    params: {
                        limit,
                        sort: 'new',
                    },
                });
                return response.data.data.children.map((child) => child.data);
            }
            catch (error) {
                console.error('Error fetching Reddit user posts:', error);
                throw new Error('Failed to fetch Reddit user posts');
            }
        });
    }
    /**
     * Fetch user's recent comments to calculate average comment karma
     */
    getUserComments(username_1) {
        return __awaiter(this, arguments, void 0, function* (username, limit = 25) {
            try {
                const response = yield axios_1.default.get(`${this.baseUrl}/user/${username}/comments`, {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'User-Agent': this.userAgent,
                    },
                    params: {
                        limit,
                        sort: 'new',
                    },
                });
                return response.data.data.children.map((child) => child.data);
            }
            catch (error) {
                console.error('Error fetching Reddit user comments:', error);
                throw new Error('Failed to fetch Reddit user comments');
            }
        });
    }
    /**
     * Calculate average upvotes from recent posts
     */
    calculateAverageUpvotes(posts) {
        if (posts.length === 0)
            return 0;
        const totalUpvotes = posts.reduce((sum, post) => sum + post.score, 0);
        return Math.round(totalUpvotes / posts.length);
    }
    /**
     * Calculate average comments from recent posts
     */
    calculateAverageComments(posts) {
        if (posts.length === 0)
            return 0;
        const totalComments = posts.reduce((sum, post) => sum + post.num_comments, 0);
        return Math.round(totalComments / posts.length);
    }
    /**
     * Calculate account age in days
     */
    calculateAccountAge(createdUtc) {
        const now = Date.now() / 1000;
        return Math.floor((now - createdUtc) / (24 * 60 * 60));
    }
    /**
     * Get comprehensive user analytics
     */
    getUserAnalytics(username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Fetch user profile
                const profile = yield this.getUserProfile(username);
                // Fetch recent posts and comments
                const [posts, comments] = yield Promise.all([
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
            }
            catch (error) {
                console.error('Error getting user analytics:', error);
                throw error;
            }
        });
    }
}
exports.RedditService = RedditService;
