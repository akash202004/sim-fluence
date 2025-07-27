import express from "express";
import {
  createSummary,
  getSummaryBySimulation,
} from "../controllers/summaryController";

const router = express.Router();

router.post("/", createSummary);
router.get("/:simulationId", getSummaryBySimulation);

export default router;
