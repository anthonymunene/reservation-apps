import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

import { createUsers } from '../src/db/seed/users';
import {
  createProperties,
  createPropertyTypes,
  createAmenities,
} from '../src/db/seed/properties';
import { Property } from '../interfaces/prismaTypes';
import { createReview } from '../src/db/seed/reviews';

const prisma = new PrismaClient();
faker.setLocale('en_GB');

async function createSeedTransaction(client: PrismaClient) {
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
    await createPropertyTypes(prisma),
  ]).then(async () => {
    await createSeedTransaction(prisma);
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
