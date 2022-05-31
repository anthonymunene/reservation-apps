/*
  Warnings:

  - Added the required column `rating` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "rating" DECIMAL(65,30) NOT NULL;
