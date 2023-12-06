/*
  Warnings:

  - The `deviceIds` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "deviceIds",
ADD COLUMN     "deviceIds" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "User_deviceIds_key" ON "User"("deviceIds");
