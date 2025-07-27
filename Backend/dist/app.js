"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const simulationRoute_1 = __importDefault(require("./routes/simulationRoute"));
const agentReactionRoute_1 = __importDefault(require("./routes/agentReactionRoute"));
const summaryRoute_1 = __importDefault(require("./routes/summaryRoute"));
const postSuggestionRoute_1 = __importDefault(require("./routes/postSuggestionRoute"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static("public"));
app.use("/api/v1/user", userRoute_1.default);
app.use("/api/v1/simulation", simulationRoute_1.default);
app.use("/api/v1/agentReaction", agentReactionRoute_1.default);
app.use("/api/v1/summary", summaryRoute_1.default);
app.use("/api/v1/postSuggestion", postSuggestionRoute_1.default);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
