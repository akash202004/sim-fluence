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
exports.deleteSimulation = exports.updateSimulation = exports.getSimulationById = exports.getSimulations = exports.createSimulation = void 0;
const prismaClient_1 = require("../config/prismaClient");
// Create a new simulation
const createSimulation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content, status, userId, platform } = req.body;
        const simulation = yield prismaClient_1.prisma.simulation.create({
            data: {
                content,
                status,
                userId,
                platform,
            },
        });
        res.status(201).json(simulation);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create simulation" });
    }
});
exports.createSimulation = createSimulation;
// Get all simulations (with optional filters)
const getSimulations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, platform, status } = req.query;
        const where = {};
        if (userId)
            where.userId = userId;
        if (platform)
            where.platform = platform;
        if (status)
            where.status = status;
        const simulations = yield prismaClient_1.prisma.simulation.findMany({
            where,
            include: {
                user: true,
                agentReactions: true,
                summary: true,
                PostSuggestion: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.json(simulations);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch simulations" });
    }
});
exports.getSimulations = getSimulations;
// Get a simulation by ID
const getSimulationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const simulation = yield prismaClient_1.prisma.simulation.findUnique({
            where: { id },
            include: {
                user: true,
                agentReactions: true,
                summary: true,
                PostSuggestion: true,
            },
        });
        if (!simulation) {
            res.status(404).json({ error: "Simulation not found" });
            return;
        }
        res.json(simulation);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch simulation" });
    }
});
exports.getSimulationById = getSimulationById;
// Update a simulation by ID
const updateSimulation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const data = req.body;
        const simulation = yield prismaClient_1.prisma.simulation.update({
            where: { id },
            data,
        });
        res.json(simulation);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update simulation" });
    }
});
exports.updateSimulation = updateSimulation;
// Delete a simulation by ID
const deleteSimulation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.prisma.simulation.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete simulation" });
    }
});
exports.deleteSimulation = deleteSimulation;
