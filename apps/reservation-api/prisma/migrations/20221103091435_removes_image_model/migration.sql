/*
  Warnings:

  - You are about to drop the column `profilePic` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "profilePic",
ADD COLUMN     "defaultProfilePic" TEXT,
ADD COLUMN     "profilePics" TEXT[];

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "images" TEXT[];
