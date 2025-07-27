-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountAge" INTEGER,
ADD COLUMN     "averageComments" INTEGER DEFAULT 0,
ADD COLUMN     "averageLikes" INTEGER DEFAULT 0,
ADD COLUMN     "averagePostImpressions" INTEGER DEFAULT 0,
ADD COLUMN     "averageShares" INTEGER DEFAULT 0,
ADD COLUMN     "engagementRate" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "followers" INTEGER DEFAULT 0,
ADD COLUMN     "following" INTEGER DEFAULT 0,
ADD COLUMN     "lastActive" TIMESTAMP(3),
ADD COLUMN     "redditAccountAge" INTEGER,
ADD COLUMN     "redditKarma" INTEGER DEFAULT 0,
ADD COLUMN     "totalPosts" INTEGER DEFAULT 0,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "User_followers_idx" ON "User"("followers");

-- CreateIndex
CREATE INDEX "User_engagementRate_idx" ON "User"("engagementRate");
