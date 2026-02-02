-- Add user profile + OTP verification fields
ALTER TABLE "User" ADD COLUMN "name" TEXT;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "emailOtpHash" TEXT;
ALTER TABLE "User" ADD COLUMN "emailOtpExpiresAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "emailOtpAttempts" INTEGER NOT NULL DEFAULT 0;
