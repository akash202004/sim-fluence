import { prisma } from "../config/prismaClient";
import { Request, Response } from "express";
import { RedditService } from "../services/redditService";

// create user
export const createUser = async (req: Request, res: Response) => {
  const { 
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
    verified
  } = req.body;
  try {
    const user = await prisma.user.create({
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
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
};

// get user by id
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
       res.status(404).json({ error: "User not found" });
       return;
      }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
};

// get all user
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
};

// Find or create user by email or redditId
export const findOrCreateUser = async (req: Request, res: Response) => {
  const { 
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
    verified
  } = req.body;
  try {
    let user = null;
    
    // First try to find by redditId if provided
    if (redditId) {
      user = await prisma.user.findUnique({ 
        where: { redditId } 
      });
    }
    
    // If not found by redditId, try by email
    if (!user && email) {
      user = await prisma.user.findUnique({ 
        where: { email } 
      });
    }
    
    // If user doesn't exist, create new user
    if (!user) {
      user = await prisma.user.create({
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
    } else {
      // Update existing user with new information
      user = await prisma.user.update({
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
  } catch (error) {
    console.error('Error in findOrCreateUser:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : String(error), details: error });
  }
};

// Get user by reddit ID
export const getUserByRedditId = async (req: Request, res: Response) => {
  const { redditId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { redditId },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
};

// Update user analytics
export const updateUserAnalytics = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    redditKarma,
    redditAccountAge,
    totalPostKarma,
    commentKarma,
    averageUpvotes,
    averageComments,
    engagementRate,
    totalPosts,
    verified
  } = req.body;
  
  try {
    const user = await prisma.user.update({
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
  } catch (error) {
    console.error('Error updating user analytics:', error);
    res.status(500).json({ error: "Error updating user analytics" });
  }
};

// Update user analytics with detailed Reddit data
export const updateUserRedditAnalytics = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { accessToken } = req.body;
  
  try {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user || !user.redditUsername) {
      res.status(404).json({ error: "User not found or no Reddit username" });
      return;
    }

    // Create Reddit service instance
    const redditService = new RedditService(accessToken);
    
    // Fetch detailed Reddit analytics
    const redditAnalytics = await redditService.getUserAnalytics(user.redditUsername);

    // Update user with new analytics
    const updatedUser = await prisma.user.update({
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
  } catch (error) {
    console.error('Error updating user Reddit analytics:', error);
    res.status(500).json({ error: "Error updating user Reddit analytics" });
  }
};

// Get users with analytics (for leaderboards, etc.)
export const getUsersWithAnalytics = async (req: Request, res: Response) => {
  const { sortBy = 'redditKarma', order = 'desc', limit = 10 } = req.query;
  
  try {
    const users = await prisma.user.findMany({
      where: {
        redditKarma: { gt: 0 }, // Only users with Reddit karma
      },
      orderBy: {
        [sortBy as string]: order as 'asc' | 'desc',
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
  } catch (error) {
    console.error('Error fetching users with analytics:', error);
    res.status(500).json({ error: "Error fetching users with analytics" });
  }
};
