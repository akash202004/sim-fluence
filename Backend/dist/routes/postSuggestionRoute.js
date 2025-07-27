"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postSuggestionController_1 = require("../controllers/postSuggestionController");
const router = express_1.default.Router();
router.post("/", postSuggestionController_1.createPostSuggestion);
router.get("/:simulationId", postSuggestionController_1.getSuggestionsBySimulation);
router.patch("/apply/:id", postSuggestionController_1.applySuggestion);
exports.default = router;
