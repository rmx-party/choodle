/*
  Warnings:

  - You are about to drop the column `sanityId` on the `Challenge` table. All the data in the column will be lost.
  - Made the column `prompt` on table `Challenge` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Challenge_sanityId_key";

-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "sanityId",
ALTER COLUMN "prompt" SET NOT NULL;
