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
exports.getSummaryBySimulation = exports.createSummary = void 0;
const prismaClient_1 = require("../config/prismaClient");
const createSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { simulationId, summaryText, toneCloud, toneBreakdown, sectionFeedback, engagementData, audienceMatch, feedbackScore, } = req.body;
        const summary = yield prismaClient_1.prisma.summary.create({
            data: {
                simulationId,
                summaryText,
                toneCloud,
                toneBreakdown,
                sectionFeedback,
                engagementData,
                audienceMatch,
                feedbackScore,
            },
        });
        res.status(201).json(summary);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create summary' });
    }
});
exports.createSummary = createSummary;
const getSummaryBySimulation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { simulationId } = req.params;
        const summary = yield prismaClient_1.prisma.summary.findUnique({
            where: { simulationId },
        });
        res.json(summary);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});
exports.getSummaryBySimulation = getSummaryBySimulation;
