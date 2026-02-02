/*
  Warnings:

  - You are about to drop the column `propertyType` on the `Property` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('residential', 'commercial');

-- CreateEnum
CREATE TYPE "RentFrequency" AS ENUM ('yearly', 'monthly', 'weekly', 'daily');

-- DropIndex
DROP INDEX "Property_propertyType_idx";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "propertyType",
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "rentFrequency" "RentFrequency",
ADD COLUMN     "subCategoryId" TEXT;

-- DropEnum
DROP TYPE "PropertyType";

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "SubCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Category_type_idx" ON "Category"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Category_type_name_key" ON "Category"("type", "name");

-- CreateIndex
CREATE INDEX "SubCategory_categoryId_idx" ON "SubCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "SubCategory_categoryId_name_key" ON "SubCategory"("categoryId", "name");

-- CreateIndex
CREATE INDEX "Property_categoryId_idx" ON "Property"("categoryId");

-- CreateIndex
CREATE INDEX "Property_subCategoryId_idx" ON "Property"("subCategoryId");

-- CreateIndex
CREATE INDEX "Property_areaSqft_idx" ON "Property"("areaSqft");

-- CreateIndex
CREATE INDEX "Property_rentFrequency_idx" ON "Property"("rentFrequency");

-- Seed default categories (stable IDs for backfill)
INSERT INTO "Category" ("id", "name", "type", "sortOrder")
VALUES
  ('cat_residential', 'Residential', 'residential', 1),
  ('cat_commercial', 'Commercial', 'commercial', 2)
ON CONFLICT DO NOTHING;

-- Backfill existing properties to Residential by default
UPDATE "Property"
SET "categoryId" = 'cat_residential'
WHERE "categoryId" IS NULL;

-- Make categoryId required now that data is backfilled
ALTER TABLE "Property" ALTER COLUMN "categoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
