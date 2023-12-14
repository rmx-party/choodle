/*
  Warnings:

  - Changed the type of `credentialPublicKey` on the `FidoAuthenticator` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "FidoAuthenticator" DROP COLUMN "credentialPublicKey",
ADD COLUMN     "credentialPublicKey" BYTEA NOT NULL;
