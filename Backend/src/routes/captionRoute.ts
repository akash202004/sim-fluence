import { Router } from 'express';
import {
  createCaption,
  getCaptions,
  getCaptionsByUser,
  getCaptionById,
  deleteCaption,
} from "../controllers/captionController";

const router = Router();

// Create a new caption
router.post('/', createCaption);

// Get all captions (with optional filters)
router.get('/', getCaptions);

// Get captions by user ID
router.get('/user/:userId', getCaptionsByUser);

// Get a specific caption by ID
router.get('/:id', getCaptionById);

// Delete a caption by ID
router.delete('/:id', deleteCaption);

export default router; 