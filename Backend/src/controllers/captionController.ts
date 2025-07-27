import { Request, Response } from "express";
import { prisma } from "../config/prismaClient";

// Create a new caption
export const createCaption = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      caption,
      platform,
      tone,
      captionType,
      description,
      photoCount
    } = req.body;

    const newCaption = await prisma.caption.create({
      data: {
        userId,
        caption,
        platform,
        tone,
        captionType,
        description,
        photoCount,
      },
    });

    res.status(201).json(newCaption);
  } catch (error) {
    console.error('Error creating caption:', error);
    res.status(500).json({ error: "Failed to create caption" });
  }
};

// Get all captions for a user
export const getCaptionsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const captions = await prisma.caption.findMany({
      where: { userId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(captions);
  } catch (error) {
    console.error('Error fetching captions:', error);
    res.status(500).json({ error: "Failed to fetch captions" });
  }
};

// Get all captions (with optional filters)
export const getCaptions = async (req: Request, res: Response) => {
  try {
    const { userId, platform, tone, captionType } = req.query;

    const where: any = {};
    if (userId) where.userId = userId;
    if (platform) where.platform = platform;
    if (tone) where.tone = tone;
    if (captionType) where.captionType = captionType;

    const captions = await prisma.caption.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(captions);
  } catch (error) {
    console.error('Error fetching captions:', error);
    res.status(500).json({ error: "Failed to fetch captions" });
  }
};

// Get a caption by ID
export const getCaptionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const caption = await prisma.caption.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!caption) {
      res.status(404).json({ error: "Caption not found" });
      return;
    }

    res.json(caption);
  } catch (error) {
    console.error('Error fetching caption:', error);
    res.status(500).json({ error: "Failed to fetch caption" });
  }
};

// Delete a caption by ID
export const deleteCaption = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.caption.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting caption:', error);
    res.status(500).json({ error: "Failed to delete caption" });
  }
}; 