-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentAuthenticationChallenge" TEXT;

-- CreateTable
CREATE TABLE "fidoAuthenticators" (
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

    CONSTRAINT "fidoAuthenticators_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fidoAuthenticators_credentialID_key" ON "fidoAuthenticators"("credentialID");

-- AddForeignKey
ALTER TABLE "fidoAuthenticators" ADD CONSTRAINT "fidoAuthenticators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
