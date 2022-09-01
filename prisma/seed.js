const { faker } = require("@faker-js/faker");
const { PrismaClient } = require("@prisma/client");

const { createUsers } = require("../src/db/seed/users");
const {
  createProperties,
  createPropertyTypes,
  propertyTypes,
  createAmenities,
} = require("../src/db/seed/properties");
const { createReview } = require("../src/db/seed/reviews");

const prisma = new PrismaClient();
faker.setLocale("en_GB");

async function createSeedTransaction(client) {
  return await client.$transaction(async () => {
    return [
      await createProperties(client),
      await createUsers(client),
      await createReview(client),
    ];
  });
}

async function main() {
  await Promise.all([
    await createAmenities(prisma),
    await createPropertyTypes(prisma, propertyTypes),
  ])
  .then(async () => {
    await createSeedTransaction(prisma)
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
