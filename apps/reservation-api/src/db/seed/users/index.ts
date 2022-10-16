import { faker } from '@faker-js/faker';
import { Prisma, PrismaClient } from '@prisma/client';

// import { getAllPropertiesById, randomised } from '../properties/';

import { seedImages, clearImageFolder } from '../seedImages';

const userImageDir = './src/db/seed/users/images';
const getMultipleRandomisedPropertyIds = async (properties) =>
  faker.helpers.arrayElements(properties, 2);

const getAllPropertiesWithoutOwner = async (client: PrismaClient) => {
  return client.property.findMany({
    where: {
      hostId: null,
    },
    select: {
      id: true,
    },
  });
};
const userAccounts = Array.from({ length: 10 }).map(() => ({
  email: faker.internet.email(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
}));

export const createUsers = async (client: PrismaClient) => {
  await clearImageFolder(`${userImageDir}/*.png`)
    .then((deletedFiles) => console.log('done! deleted files:', deletedFiles))
    .catch(console.error);
  for (let index = 0; index < userAccounts.length; index++) {
    const imageURL = await seedImages('face', {
      dir: userImageDir,
      user: userAccounts[index],
    });
    console.log(imageURL);
    await getAllPropertiesWithoutOwner(client).then(async (properties) => {
      const randomProperties = await getMultipleRandomisedPropertyIds(
        properties
      );
      const user = await client.user.create({
        data: {
          ...userAccounts[index],
          profile: {
            create: {
              bio: faker.lorem.sentences(),
              profilePic: imageURL,
              superHost: false,
            },
          },
          properties: {
            connect: randomProperties,
          },
        },
      });
    });
  }
};
