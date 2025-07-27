import { Request, Response } from "express";
import { prisma } from "../config/prismaClient";

// Create a new simulation
export const createSimulation = async (req: Request, res: Response) => {
  try {
    const {content, status, userId, platform } = req.body;

    const simulation = await prisma.simulation.create({
      data: {
        content,
        status, 
        userId,
        platform,
      },
    });

    res.status(201).json(simulation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create simulation" });
  }
};

// Get all simulations (with optional filters)
export const getSimulations = async (req: Request, res: Response) => {
  try {
    const { userId, platform, status } = req.query;

    const where: any = {};
    if (userId) where.userId = userId;
    if (platform) where.platform = platform;
    if (status) where.status = status;

    const simulations = await prisma.simulation.findMany({
      where,
      include: {
        user: true,
        agentReactions: true,
        summary: true,
        PostSuggestion: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(simulations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch simulations" });
  }
};

// Get a simulation by ID
export const getSimulationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const simulation = await prisma.simulation.findUnique({
      where: { id },
      include: {
        user: true,
        agentReactions: true,
        summary: true,
        PostSuggestion: true,
      },
    });

    if (!simulation) {
      res.status(404).json({ error: "Simulation not found" });
      return;
    }

    res.json(simulation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch simulation" });
  }
};

// Update a simulation by ID
export const updateSimulation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const simulation = await prisma.simulation.update({
      where: { id },
      data,
    });

    res.json(simulation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update simulation" });
  }
};

// Delete a simulation by ID
export const deleteSimulation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.simulation.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete simulation" });
  }
};
