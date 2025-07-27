"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const agentReactionControllerst_1 = require("../controllers/agentReactionControllerst");
const router = express_1.default.Router();
router.post("/", agentReactionControllerst_1.createAgentReaction);
router.get("/:simulationId", agentReactionControllerst_1.getAgentReactionsBySimulation);
exports.default = router;
