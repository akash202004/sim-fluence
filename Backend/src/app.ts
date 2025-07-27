import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoute";
import simulationRoutes from "./routes/simulationRoute";
import agentReaction from "./routes/agentReactionRoute"
import summary from "./routes/summaryRoute"
import postSuggestion from "./routes/postSuggestionRoute"
import captionRoutes from "./routes/captionRoute";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/simulation", simulationRoutes);
app.use("/api/v1/agent-reaction", agentReaction);
app.use("/api/v1/summary", summary);
app.use("/api/v1/post-suggestion", postSuggestion);
app.use("/api/v1/caption", captionRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
