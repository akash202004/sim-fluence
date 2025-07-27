-- AlterTable
ALTER TABLE "User" ADD COLUMN     "averageUpvotes" INTEGER DEFAULT 0,
ADD COLUMN     "commentKarma" INTEGER DEFAULT 0,
ADD COLUMN     "totalPostKarma" INTEGER DEFAULT 0;
