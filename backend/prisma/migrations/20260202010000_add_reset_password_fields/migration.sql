-- Add reset password fields
ALTER TABLE "User" ADD COLUMN "resetPasswordTokenHash" TEXT;
ALTER TABLE "User" ADD COLUMN "resetPasswordExpiresAt" TIMESTAMP(3);
