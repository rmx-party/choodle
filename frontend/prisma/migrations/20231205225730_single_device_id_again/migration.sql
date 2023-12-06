/*
  Warnings:

  - You are about to drop the column `deviceIds` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[deviceId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deviceId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_deviceIds_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "deviceIds",
ADD COLUMN     "deviceId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_deviceId_key" ON "User"("deviceId");
