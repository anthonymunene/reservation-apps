/*
  Warnings:

  - The primary key for the `AmenitiesOnProperty` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `amenitiesId` on the `AmenitiesOnProperty` table. All the data in the column will be lost.
  - Added the required column `amenityId` to the `AmenitiesOnProperty` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AmenitiesOnProperty" DROP CONSTRAINT "AmenitiesOnProperty_amenitiesId_fkey";

-- AlterTable
ALTER TABLE "AmenitiesOnProperty" DROP CONSTRAINT "AmenitiesOnProperty_pkey",
DROP COLUMN "amenitiesId",
ADD COLUMN     "amenityId" INTEGER NOT NULL,
ADD CONSTRAINT "AmenitiesOnProperty_pkey" PRIMARY KEY ("amenityId", "propertyId");

-- AddForeignKey
ALTER TABLE "AmenitiesOnProperty" ADD CONSTRAINT "AmenitiesOnProperty_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "Amenity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
