/*
  Warnings:

  - You are about to drop the column `houseId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the `AmenitiesOnHouses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `House` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HousesOnHosts` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[propertyId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `propertyId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AmenitiesOnHouses" DROP CONSTRAINT "AmenitiesOnHouses_amenityId_fkey";

-- DropForeignKey
ALTER TABLE "AmenitiesOnHouses" DROP CONSTRAINT "AmenitiesOnHouses_houseId_fkey";

-- DropForeignKey
ALTER TABLE "House" DROP CONSTRAINT "House_propertyTypeId_fkey";

-- DropForeignKey
ALTER TABLE "HousesOnHosts" DROP CONSTRAINT "HousesOnHosts_hostId_fkey";

-- DropForeignKey
ALTER TABLE "HousesOnHosts" DROP CONSTRAINT "HousesOnHosts_houseId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_houseId_fkey";

-- DropIndex
DROP INDEX "Review_houseId_key";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "houseId",
ADD COLUMN     "propertyId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "AmenitiesOnHouses";

-- DropTable
DROP TABLE "House";

-- DropTable
DROP TABLE "HousesOnHosts";

-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "propertyTypeId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "town" TEXT NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "beds" INTEGER NOT NULL,
    "baths" INTEGER,
    "superhost" BOOLEAN NOT NULL DEFAULT false,
    "entirePlace" BOOLEAN NOT NULL DEFAULT false,
    "defaultImage" TEXT NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmenitiesOnProperties" (
    "amenityId" INTEGER NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "AmenitiesOnProperties_pkey" PRIMARY KEY ("amenityId","propertyId")
);

-- CreateTable
CREATE TABLE "PropertiesOnHosts" (
    "hostId" INTEGER NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "PropertiesOnHosts_pkey" PRIMARY KEY ("hostId","propertyId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_propertyId_key" ON "Review"("propertyId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_propertyTypeId_fkey" FOREIGN KEY ("propertyTypeId") REFERENCES "PropertyType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmenitiesOnProperties" ADD CONSTRAINT "AmenitiesOnProperties_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmenitiesOnProperties" ADD CONSTRAINT "AmenitiesOnProperties_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "Amenity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertiesOnHosts" ADD CONSTRAINT "PropertiesOnHosts_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertiesOnHosts" ADD CONSTRAINT "PropertiesOnHosts_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
