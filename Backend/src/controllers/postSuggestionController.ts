import { Request, Response } from 'express';
import { prisma } from "../config/prismaClient";

export const createPostSuggestion = async (req: Request, res: Response) => {
  try {
    const { simulationId, suggestionText } = req.body;
    const suggestion = await prisma.postSuggestion.create({
      data: { simulationId, suggestionText },
    });
    res.status(201).json(suggestion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post suggestion' });
  }
};

export const getSuggestionsBySimulation = async (req: Request, res: Response) => {
  try {
    const { simulationId } = req.params;
    const suggestions = await prisma.postSuggestion.findMany({
      where: { simulationId },
    });
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
};

export const applySuggestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await prisma.postSuggestion.update({
      where: { id },
      data: { applied: true },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to apply suggestion' });
  }
};
