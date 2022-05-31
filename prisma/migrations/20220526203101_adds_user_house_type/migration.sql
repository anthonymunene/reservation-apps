/*
  Warnings:

  - You are about to drop the column `type` on the `House` table. All the data in the column will be lost.
  - Added the required column `houseTypeId` to the `House` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "House" DROP COLUMN "type",
ADD COLUMN     "houseTypeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "HouseType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "HouseType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HouseType_name_key" ON "HouseType"("name");

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_houseTypeId_fkey" FOREIGN KEY ("houseTypeId") REFERENCES "HouseType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
