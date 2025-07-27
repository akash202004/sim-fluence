-- CreateTable
CREATE TABLE "Caption" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "captionType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photoCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Caption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Caption_userId_idx" ON "Caption"("userId");

-- CreateIndex
CREATE INDEX "Caption_createdAt_idx" ON "Caption"("createdAt");

-- AddForeignKey
ALTER TABLE "Caption" ADD CONSTRAINT "Caption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
