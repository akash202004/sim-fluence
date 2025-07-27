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
exports.applySuggestion = exports.getSuggestionsBySimulation = exports.createPostSuggestion = void 0;
const prismaClient_1 = require("../config/prismaClient");
const createPostSuggestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { simulationId, suggestionText } = req.body;
        const suggestion = yield prismaClient_1.prisma.postSuggestion.create({
            data: { simulationId, suggestionText },
        });
        res.status(201).json(suggestion);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create post suggestion' });
    }
});
exports.createPostSuggestion = createPostSuggestion;
const getSuggestionsBySimulation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { simulationId } = req.params;
        const suggestions = yield prismaClient_1.prisma.postSuggestion.findMany({
            where: { simulationId },
        });
        res.json(suggestions);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
});
exports.getSuggestionsBySimulation = getSuggestionsBySimulation;
const applySuggestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updated = yield prismaClient_1.prisma.postSuggestion.update({
            where: { id },
            data: { applied: true },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to apply suggestion' });
    }
});
exports.applySuggestion = applySuggestion;
