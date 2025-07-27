import { Request, Response } from 'express';
import { prisma } from "../config/prismaClient";

export const createAgentReaction = async (req: Request, res: Response) => {
  try {
    const { simulationId, agentName, action, reason, sentiment } = req.body;
    const reaction = await prisma.agentReaction.create({
      data: { simulationId, agentName, action, reason, sentiment },
    });
    res.status(201).json(reaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create agent reaction' });
  }
};

export const getAgentReactionsBySimulation = async (req: Request, res: Response) => {
  try {
    const { simulationId } = req.params;
    const reactions = await prisma.agentReaction.findMany({
      where: { simulationId },
    });
    res.json(reactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agent reactions' });
  }
};
