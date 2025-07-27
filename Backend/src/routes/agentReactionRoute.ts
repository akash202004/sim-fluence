import express from "express";
import {
  createAgentReaction,
  getAgentReactionsBySimulation,
} from "../controllers/agentReactionControllerst";

const router = express.Router();

router.post("/", createAgentReaction);
router.get("/:simulationId", getAgentReactionsBySimulation);

export default router;
