/*
  Warnings:

  - You are about to drop the `fidoAuthenticators` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "fidoAuthenticators" DROP CONSTRAINT "fidoAuthenticators_userId_fkey";

-- DropTable
DROP TABLE "fidoAuthenticators";

-- CreateTable
CREATE TABLE "FidoAuthenticator" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "credentialID" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" BIGINT NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT[],

    CONSTRAINT "FidoAuthenticator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FidoAuthenticator_credentialID_key" ON "FidoAuthenticator"("credentialID");

-- AddForeignKey
ALTER TABLE "FidoAuthenticator" ADD CONSTRAINT "FidoAuthenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
