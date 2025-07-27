"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
router.post("/", userController_1.createUser);
router.post("/findOrCreate", userController_1.findOrCreateUser);
router.get("/:id", userController_1.getUserById);
router.get("/reddit/:redditId", userController_1.getUserByRedditId);
router.get("/", userController_1.getAllUsers);
// Analytics routes
router.put("/:id/analytics", userController_1.updateUserAnalytics);
router.put("/:id/reddit-analytics", userController_1.updateUserRedditAnalytics);
router.get("/analytics/leaderboard", userController_1.getUsersWithAnalytics);
exports.default = router;
