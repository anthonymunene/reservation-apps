/*
  Warnings:

  - You are about to drop the column `houseTypeId` on the `House` table. All the data in the column will be lost.
  - You are about to drop the `HouseType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `propertyTypeId` to the `House` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "House" DROP CONSTRAINT "House_houseTypeId_fkey";

-- AlterTable
ALTER TABLE "House" DROP COLUMN "houseTypeId",
ADD COLUMN     "propertyTypeId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "HouseType";

-- CreateTable
CREATE TABLE "PropertyType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "PropertyType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PropertyType_name_key" ON "PropertyType"("name");

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_propertyTypeId_fkey" FOREIGN KEY ("propertyTypeId") REFERENCES "PropertyType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
