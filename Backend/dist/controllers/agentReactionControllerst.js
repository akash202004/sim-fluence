"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgentReactionsBySimulation = exports.createAgentReaction = void 0;
const prismaClient_1 = require("../config/prismaClient");
const createAgentReaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { simulationId, agentName, action, reason, sentiment } = req.body;
        const reaction = yield prismaClient_1.prisma.agentReaction.create({
            data: { simulationId, agentName, action, reason, sentiment },
        });
        res.status(201).json(reaction);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create agent reaction' });
    }
});
exports.createAgentReaction = createAgentReaction;
const getAgentReactionsBySimulation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { simulationId } = req.params;
        const reactions = yield prismaClient_1.prisma.agentReaction.findMany({
            where: { simulationId },
        });
        res.json(reactions);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch agent reactions' });
    }
});
exports.getAgentReactionsBySimulation = getAgentReactionsBySimulation;
