import { Request, Response } from 'express';
import { prisma } from '../config/prismaClient';

// GET /api/health
export const getHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      message: 'All systems operational'
    });
  } catch (error: any) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
};

// GET /api/health/db
export const getDatabaseHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    // Test database connection with more details
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;

    res.status(200).json({
      database: 'connected',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      message: 'Database connection successful'
    });
  } catch (error: any) {
    console.error('Database health check failed:', error);
    res.status(500).json({
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      error: error.message,
      message: 'Database connection failed'
    });
  }
}; 