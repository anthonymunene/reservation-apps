/*
  Warnings:

  - You are about to drop the column `houseId` on the `Amenity` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Amenity" DROP CONSTRAINT "Amenity_houseId_fkey";

-- DropIndex
DROP INDEX "Amenity_houseId_key";

-- AlterTable
ALTER TABLE "Amenity" DROP COLUMN "houseId";

-- CreateTable
CREATE TABLE "AmenitiesOnHouses" (
    "amenityId" INTEGER NOT NULL,
    "houseId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "AmenitiesOnHouses_pkey" PRIMARY KEY ("amenityId","houseId")
);

-- AddForeignKey
ALTER TABLE "AmenitiesOnHouses" ADD CONSTRAINT "AmenitiesOnHouses_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmenitiesOnHouses" ADD CONSTRAINT "AmenitiesOnHouses_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "Amenity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
