import express from "express";
import {
  createAgentReaction,
  getAgentReactionsBySimulation,
} from "../controllers/agentReactionControllerst";
import { getAiLikes } from '../controllers/aiLikesController';

const router = express.Router();

router.post("/", createAgentReaction);
router.get("/:simulationId", getAgentReactionsBySimulation);
router.post('/ai/likes', getAiLikes);

export default router;
