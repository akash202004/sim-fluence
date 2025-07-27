import express from "express";
import {
  createPostSuggestion,
  getSuggestionsBySimulation,
  applySuggestion,
} from "../controllers/postSuggestionController";

const router = express.Router();

router.post("/", createPostSuggestion);
router.get("/:simulationId", getSuggestionsBySimulation);
router.patch("/apply/:id", applySuggestion);

export default router;
