/*
  Warnings:

  - A unique constraint covering the columns `[sanityId]` on the table `Challenge` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sanityId]` on the table `Drawing` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sanityId]` on the table `GuessResult` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sanityId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "sanityId" TEXT;

-- AlterTable
ALTER TABLE "Drawing" ADD COLUMN     "sanityId" TEXT;

-- AlterTable
ALTER TABLE "GuessResult" ADD COLUMN     "sanityId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sanityId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_sanityId_key" ON "Challenge"("sanityId");

-- CreateIndex
CREATE UNIQUE INDEX "Drawing_sanityId_key" ON "Drawing"("sanityId");

-- CreateIndex
CREATE UNIQUE INDEX "GuessResult_sanityId_key" ON "GuessResult"("sanityId");

-- CreateIndex
CREATE UNIQUE INDEX "User_sanityId_key" ON "User"("sanityId");
