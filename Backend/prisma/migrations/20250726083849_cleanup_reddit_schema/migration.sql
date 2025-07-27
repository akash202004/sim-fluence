/*
  Warnings:

  - You are about to drop the column `accountAge` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `averageLikes` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `averagePostImpressions` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `averageShares` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `followers` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `following` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_followers_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "accountAge",
DROP COLUMN "averageLikes",
DROP COLUMN "averagePostImpressions",
DROP COLUMN "averageShares",
DROP COLUMN "followers",
DROP COLUMN "following";

-- CreateIndex
CREATE INDEX "User_redditKarma_idx" ON "User"("redditKarma");
