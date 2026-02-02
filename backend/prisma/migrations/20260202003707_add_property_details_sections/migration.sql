-- CreateEnum
CREATE TYPE "CompletionStatus" AS ENUM ('ready', 'off_plan');

-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('freehold', 'leasehold');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "balconySizeSqft" INTEGER,
ADD COLUMN     "buildingName" TEXT,
ADD COLUMN     "completion" "CompletionStatus",
ADD COLUMN     "developerName" TEXT,
ADD COLUMN     "elevators" INTEGER,
ADD COLUMN     "handoverDate" TEXT,
ADD COLUMN     "ownership" "OwnershipType",
ADD COLUMN     "parkingAvailable" BOOLEAN,
ADD COLUMN     "referenceNo" TEXT,
ADD COLUMN     "swimmingPools" INTEGER,
ADD COLUMN     "totalBuildingAreaSqft" INTEGER,
ADD COLUMN     "totalFloors" INTEGER,
ADD COLUMN     "totalParkingSpaces" INTEGER,
ADD COLUMN     "truCheckOn" TIMESTAMP(3);
