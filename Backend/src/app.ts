import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoute";
import simulationRoutes from "./routes/simulationRoute";
import agentReaction from "./routes/agentReactionRoute"
import summary from "./routes/summaryRoute"
import postSuggestion from "./routes/postSuggestionRoute"
import captionRoutes from "./routes/captionRoute";
import uploadRoutes from "./routes/uploadRoute"
import healthRoutes from "./routes/healthRoute"
import { prisma } from './config/prismaClient';

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
app.use("/api/v1/upload", uploadRoutes)
app.use("/api/health", healthRoutes)

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database status: CONNECTED');
  } catch (err) {
    console.error('Database status: DISCONNECTED', err);
  }
});

export default app;
