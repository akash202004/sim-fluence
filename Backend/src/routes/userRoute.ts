import { Router } from "express";
import { 
  createUser, 
  getUserById, 
  findOrCreateUser, 
  getUserByRedditId,
  updateUserAnalytics,
  updateUserRedditAnalytics,
  getUsersWithAnalytics,
  getAllUsers
} from "../controllers/userController";

const router = Router();

router.post("/", createUser);
router.post("/findOrCreate", findOrCreateUser);
router.get("/:id", getUserById);
router.get("/reddit/:redditId", getUserByRedditId);
router.get("/", getAllUsers);

// Analytics routes
router.put("/:id/analytics", updateUserAnalytics);
router.put("/:id/reddit-analytics", updateUserRedditAnalytics);
router.get("/analytics/leaderboard", getUsersWithAnalytics);

export default router;
