/*
  Warnings:

  - You are about to drop the `AmenitiesOnHouses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AmenitiesOnHouses" DROP CONSTRAINT "AmenitiesOnHouses_amenityId_fkey";

-- DropForeignKey
ALTER TABLE "AmenitiesOnHouses" DROP CONSTRAINT "AmenitiesOnHouses_houseId_fkey";

-- DropTable
DROP TABLE "AmenitiesOnHouses";

-- CreateTable
CREATE TABLE "_AmenityToHouse" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AmenityToHouse_AB_unique" ON "_AmenityToHouse"("A", "B");

-- CreateIndex
CREATE INDEX "_AmenityToHouse_B_index" ON "_AmenityToHouse"("B");

-- AddForeignKey
ALTER TABLE "_AmenityToHouse" ADD FOREIGN KEY ("A") REFERENCES "Amenity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AmenityToHouse" ADD FOREIGN KEY ("B") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;
