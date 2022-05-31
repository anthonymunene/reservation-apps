/*
  Warnings:

  - You are about to drop the column `superhost` on the `Property` table. All the data in the column will be lost.
  - Made the column `propertyTypeId` on table `Property` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_propertyTypeId_fkey";

-- AlterTable
ALTER TABLE "PropertiesOnHosts" ADD COLUMN     "superHost" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "superhost",
ALTER COLUMN "propertyTypeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_propertyTypeId_fkey" FOREIGN KEY ("propertyTypeId") REFERENCES "PropertyType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
