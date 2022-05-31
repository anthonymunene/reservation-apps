-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_propertyTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_propertyId_fkey";

-- AlterTable
ALTER TABLE "AmenitiesOnProperties" ALTER COLUMN "assignedBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PropertiesOnHosts" ALTER COLUMN "assignedBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Property" ALTER COLUMN "propertyTypeId" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "defaultImage" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "propertyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_propertyTypeId_fkey" FOREIGN KEY ("propertyTypeId") REFERENCES "PropertyType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
