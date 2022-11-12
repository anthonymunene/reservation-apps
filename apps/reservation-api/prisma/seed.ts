import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

import { createUsers } from '../src/db/seed/users';
import {
  createProperties,
  createPropertyTypes,
  createAmenities,
} from '../src/db/seed/properties';
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

  const users = await prisma.user.findMany({});
  console.log(`number of users is ${users.length}`);
  if (!users.length) {
    await Promise.all([
      await createAmenities(prisma),
      await createPropertyTypes(prisma),
    ]).then(async () => {
      await createSeedTransaction(prisma);
    });
  } else {
    console.log('users exist.... not seeding database');
  }
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
