import express from 'express';
import { getHealth, getDatabaseHealth } from '../controllers/healthController';

const router = express.Router();

// Health check routes
router.get('/', getHealth);
router.get('/db', getDatabaseHealth);

export default router; 