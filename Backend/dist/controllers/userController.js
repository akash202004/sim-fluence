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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersWithAnalytics = exports.updateUserRedditAnalytics = exports.updateUserAnalytics = exports.getUserByRedditId = exports.findOrCreateUser = exports.getAllUsers = exports.getUserById = exports.createUser = void 0;
const prismaClient_1 = require("../config/prismaClient");
const redditService_1 = require("../services/redditService");
// create user
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, profileImageUrl, redditId, redditUsername, redditKarma, redditAccountAge, totalPostKarma, commentKarma, averageUpvotes, averageComments, engagementRate, totalPosts, verified } = req.body;
    try {
        const user = yield prismaClient_1.prisma.user.create({
            data: {
                name,
                email,
                profileImageUrl,
                redditId,
                redditUsername,
                redditKarma,
                redditAccountAge,
                totalPostKarma,
                commentKarma,
                averageUpvotes,
                averageComments,
                engagementRate,
                totalPosts,
                verified,
                lastActive: new Date(),
            },
        });
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Error creating user" });
    }
});
exports.createUser = createUser;
// get user by id
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield prismaClient_1.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching user" });
    }
});
exports.getUserById = getUserById;
// get all user
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prismaClient_1.prisma.user.findMany();
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching users" });
    }
});
exports.getAllUsers = getAllUsers;
// Find or create user by email or redditId
const findOrCreateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, profileImageUrl, redditId, redditUsername, redditKarma, redditAccountAge, totalPostKarma, commentKarma, averageUpvotes, averageComments, engagementRate, totalPosts, verified } = req.body;
    try {
        let user = null;
        // First try to find by redditId if provided
        if (redditId) {
            user = yield prismaClient_1.prisma.user.findUnique({
                where: { redditId }
            });
        }
        // If not found by redditId, try by email
        if (!user && email) {
            user = yield prismaClient_1.prisma.user.findUnique({
                where: { email }
            });
        }
        // If user doesn't exist, create new user
        if (!user) {
            user = yield prismaClient_1.prisma.user.create({
                data: {
                    name,
                    email,
                    profileImageUrl,
                    redditId,
                    redditUsername,
                    redditKarma,
                    redditAccountAge,
                    totalPostKarma,
                    commentKarma,
                    averageUpvotes,
                    averageComments,
                    engagementRate,
                    totalPosts,
                    verified,
                    lastActive: new Date(),
                },
            });
        }
        else {
            // Update existing user with new information
            user = yield prismaClient_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    name: name || user.name,
                    profileImageUrl: profileImageUrl || user.profileImageUrl,
                    redditId: redditId || user.redditId,
                    redditUsername: redditUsername || user.redditUsername,
                    redditKarma: redditKarma !== undefined ? redditKarma : user.redditKarma,
                    redditAccountAge: redditAccountAge !== undefined ? redditAccountAge : user.redditAccountAge,
                    totalPostKarma: totalPostKarma !== undefined ? totalPostKarma : user.totalPostKarma,
                    commentKarma: commentKarma !== undefined ? commentKarma : user.commentKarma,
                    averageUpvotes: averageUpvotes !== undefined ? averageUpvotes : user.averageUpvotes,
                    averageComments: averageComments !== undefined ? averageComments : user.averageComments,
                    engagementRate: engagementRate !== undefined ? engagementRate : user.engagementRate,
                    totalPosts: totalPosts !== undefined ? totalPosts : user.totalPosts,
                    verified: verified !== undefined ? verified : user.verified,
                    lastActive: new Date(),
                },
            });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Error in findOrCreateUser:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : String(error), details: error });
    }
});
exports.findOrCreateUser = findOrCreateUser;
// Get user by reddit ID
const getUserByRedditId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { redditId } = req.params;
    try {
        const user = yield prismaClient_1.prisma.user.findUnique({
            where: { redditId },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching user" });
    }
});
exports.getUserByRedditId = getUserByRedditId;
// Update user analytics
const updateUserAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { redditKarma, redditAccountAge, totalPostKarma, commentKarma, averageUpvotes, averageComments, engagementRate, totalPosts, verified } = req.body;
    try {
        const user = yield prismaClient_1.prisma.user.update({
            where: { id },
            data: {
                redditKarma,
                redditAccountAge,
                totalPostKarma,
                commentKarma,
                averageUpvotes,
                averageComments,
                engagementRate,
                totalPosts,
                verified,
                lastActive: new Date(),
            },
        });
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Error updating user analytics:', error);
        res.status(500).json({ error: "Error updating user analytics" });
    }
});
exports.updateUserAnalytics = updateUserAnalytics;
// Update user analytics with detailed Reddit data
const updateUserRedditAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { accessToken } = req.body;
    try {
        // Get user from database
        const user = yield prismaClient_1.prisma.user.findUnique({
            where: { id },
        });
        if (!user || !user.redditUsername) {
            res.status(404).json({ error: "User not found or no Reddit username" });
            return;
        }
        // Create Reddit service instance
        const redditService = new redditService_1.RedditService(accessToken);
        // Fetch detailed Reddit analytics
        const redditAnalytics = yield redditService.getUserAnalytics(user.redditUsername);
        // Update user with new analytics
        const updatedUser = yield prismaClient_1.prisma.user.update({
            where: { id },
            data: {
                totalPostKarma: redditAnalytics.totalPostKarma,
                commentKarma: redditAnalytics.commentKarma,
                redditKarma: redditAnalytics.redditKarma,
                redditAccountAge: redditAnalytics.redditAccountAge,
                averageUpvotes: redditAnalytics.averageUpvotes,
                averageComments: redditAnalytics.averageComments,
                totalPosts: redditAnalytics.totalPosts,
                engagementRate: redditAnalytics.engagementRate,
                verified: redditAnalytics.verified,
                lastActive: new Date(),
            },
        });
        res.status(200).json({
            message: "User analytics updated successfully",
            user: updatedUser,
            redditAnalytics,
        });
    }
    catch (error) {
        console.error('Error updating user Reddit analytics:', error);
        res.status(500).json({ error: "Error updating user Reddit analytics" });
    }
});
exports.updateUserRedditAnalytics = updateUserRedditAnalytics;
// Get users with analytics (for leaderboards, etc.)
const getUsersWithAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sortBy = 'redditKarma', order = 'desc', limit = 10 } = req.query;
    try {
        const users = yield prismaClient_1.prisma.user.findMany({
            where: {
                redditKarma: { gt: 0 }, // Only users with Reddit karma
            },
            orderBy: {
                [sortBy]: order,
            },
            take: Number(limit),
            select: {
                id: true,
                name: true,
                profileImageUrl: true,
                redditUsername: true,
                redditKarma: true,
                totalPostKarma: true,
                commentKarma: true,
                engagementRate: true,
                verified: true,
                lastActive: true,
            },
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Error fetching users with analytics:', error);
        res.status(500).json({ error: "Error fetching users with analytics" });
    }
});
exports.getUsersWithAnalytics = getUsersWithAnalytics;
