-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'TWITTER', 'LINKEDIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "profileImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "postUrl" TEXT[],
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "summaryId" TEXT,

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentReaction" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "sentiment" TEXT,

    CONSTRAINT "AgentReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostSuggestion" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "suggestionText" TEXT NOT NULL,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Summary" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "summaryText" TEXT NOT NULL,
    "toneCloud" JSONB NOT NULL,
    "toneBreakdown" JSONB NOT NULL,
    "sectionFeedback" JSONB NOT NULL,
    "engagementData" JSONB NOT NULL,
    "audienceMatch" TEXT,
    "feedbackScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Summary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "User"("id");

-- CreateIndex
CREATE INDEX "Simulation_userId_idx" ON "Simulation"("userId");

-- CreateIndex
CREATE INDEX "Simulation_id_idx" ON "Simulation"("id");

-- CreateIndex
CREATE INDEX "Simulation_platform_idx" ON "Simulation"("platform");

-- CreateIndex
CREATE INDEX "Simulation_createdAt_idx" ON "Simulation"("createdAt");

-- CreateIndex
CREATE INDEX "AgentReaction_simulationId_idx" ON "AgentReaction"("simulationId");

-- CreateIndex
CREATE INDEX "AgentReaction_id_idx" ON "AgentReaction"("id");

-- CreateIndex
CREATE INDEX "PostSuggestion_simulationId_idx" ON "PostSuggestion"("simulationId");

-- CreateIndex
CREATE INDEX "PostSuggestion_id_idx" ON "PostSuggestion"("id");

-- CreateIndex
CREATE INDEX "PostSuggestion_applied_idx" ON "PostSuggestion"("applied");

-- CreateIndex
CREATE UNIQUE INDEX "Summary_simulationId_key" ON "Summary"("simulationId");

-- CreateIndex
CREATE INDEX "Summary_simulationId_idx" ON "Summary"("simulationId");

-- CreateIndex
CREATE INDEX "Summary_id_idx" ON "Summary"("id");

-- CreateIndex
CREATE INDEX "Summary_createdAt_idx" ON "Summary"("createdAt");

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentReaction" ADD CONSTRAINT "AgentReaction_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostSuggestion" ADD CONSTRAINT "PostSuggestion_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
