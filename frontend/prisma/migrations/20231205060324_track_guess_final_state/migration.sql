-- AlterTable
ALTER TABLE "GuessResult" ADD COLUMN     "final" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hintsUsed" TEXT[];
