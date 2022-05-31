const { faker } = require("@faker-js/faker");
const { PrismaClient } = require("@prisma/client");

const { createUser } = require("../src/db/seed/users");
const {
  createProperties,
  createPropertyTypes,
  getPropertiesById,
  getPropertiesTypeById,
  propertyTypes,
  createAmenities,
} = require("../src/db/seed/properties");

const prisma = new PrismaClient();
faker.setLocale("en_GB");



async function main() {
  // console.log(propertyTypes)
  await createPropertyTypes(propertyTypes);

  await createAmenities();

  await createProperties();

  // await prisma.amenity.createMany({
  //   data: amenityData
  // });

  // const propertiesWhere = await prisma.property.findMany({
  //   where: {
  //     amenities: {
  //       some: {
  //         amenity: {
  //           id: 1
  //         }
  //       }
  //     },
  //   }
  // });

  // const users = await prisma.user.findMany();

  // await prisma.property.createMany({
  //   data: propertyData,
  // });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
