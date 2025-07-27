import { Request, Response } from 'express';
import { prisma } from "../config/prismaClient";

export const createSummary = async (req: Request, res: Response) => {
  try {
    const {
      simulationId,
      summaryText,
      toneCloud,
      toneBreakdown,
      sectionFeedback,
      engagementData,
      audienceMatch,
      feedbackScore,
    } = req.body;

    const summary = await prisma.summary.create({
      data: {
        simulationId,
        summaryText,
        toneCloud,
        toneBreakdown,
        sectionFeedback,
        engagementData,
        audienceMatch,
        feedbackScore,
      },
    });

    res.status(201).json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create summary' });
  }
};

export const getSummaryBySimulation = async (req: Request, res: Response) => {
  try {
    const { simulationId } = req.params;
    const summary = await prisma.summary.findUnique({
      where: { simulationId },
    });
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
};
