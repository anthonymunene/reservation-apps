import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

// import { getAllPropertiesById, randomised } from '../properties/';

import { seedImages, clearImageFolder, createIfNotExist } from '../seedImages';

const userImageDir = `${process.cwd()}/src/db/seed/images/users`;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
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
const userAccounts = Array.from({ length: 10 }).map(() => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  return {
    email: faker.internet.email(firstName, lastName),
    firstName,
    lastName
  };
});

export const createUsers = async (client: PrismaClient) => {
  createIfNotExist(userImageDir);
  await clearImageFolder(`${userImageDir}/*.png`)
    .then((deletedFiles) => console.log('done! deleted files:', deletedFiles))
    .catch(error => console.log(`something went wrong deleting files:\n${error}`));
  for (let index = 0; index < userAccounts.length; index++) {
    const imageURL = await seedImages('face', {
      dir: userImageDir,
      user: userAccounts[index]
    });

    await getAllPropertiesWithoutOwner(client).then(async (properties) => {
      const randomProperties = await getMultipleRandomisedPropertyIds(
        properties
      );
      await client.user.create({
        data: {
          ...userAccounts[index],
          profile: {
            create: {
              bio: faker.lorem.sentences(),
              defaultProfilePic: imageURL[0],
              superHost: false,

            },
          },
          properties: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            connect: randomProperties,
          },
        },
      });
    });
  }
};
