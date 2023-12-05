/*
  Warnings:

  - You are about to drop the column `sanityId` on the `Drawing` table. All the data in the column will be lost.
  - You are about to drop the column `sanityId` on the `GuessResult` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Drawing_sanityId_key";

-- DropIndex
DROP INDEX "GuessResult_sanityId_key";

-- AlterTable
ALTER TABLE "Drawing" DROP COLUMN "sanityId";

-- AlterTable
ALTER TABLE "GuessResult" DROP COLUMN "sanityId";
