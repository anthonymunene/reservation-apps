/*
  Warnings:

  - You are about to drop the `_AmenityToHouse` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AmenityToHouse" DROP CONSTRAINT "_AmenityToHouse_A_fkey";

-- DropForeignKey
ALTER TABLE "_AmenityToHouse" DROP CONSTRAINT "_AmenityToHouse_B_fkey";

-- DropTable
DROP TABLE "_AmenityToHouse";

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
