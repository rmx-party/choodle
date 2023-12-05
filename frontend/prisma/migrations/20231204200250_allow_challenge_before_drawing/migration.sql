/*
  Warnings:

  - You are about to drop the column `promptId` on the `Challenge` table. All the data in the column will be lost.
  - Added the required column `promptSanityId` to the `Challenge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "promptId",
ADD COLUMN     "promptSanityId" TEXT NOT NULL,
ALTER COLUMN "drawingId" DROP NOT NULL;
