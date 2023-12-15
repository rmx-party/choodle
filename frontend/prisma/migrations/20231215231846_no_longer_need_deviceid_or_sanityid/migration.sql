/*
  Warnings:

  - You are about to drop the column `sanityId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_sanityId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "sanityId",
ALTER COLUMN "deviceId" DROP NOT NULL;
