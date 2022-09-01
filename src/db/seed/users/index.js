const { faker } = require("@faker-js/faker");

const { getAllPropertiesById, randomised } = require("../properties/");

const { seedImages } = require("../images");

const userImageDir = "./src/db/seed/users/images";
const getMultipleRandomisedPropertyIds = async (properties) =>
  faker.helpers.arrayElements(properties, 2);

const getAllPropertiesWithoutOwner = async (client) => {
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

const createUsers = async (client) => {
  for (let index = 0; index < userAccounts.length; index++) {

    const userImages = seedImages("face", {
      dir: userImageDir,
      user: userAccounts[index],
    });
    //   await getAllPropertiesWithoutOwner(client).then(async (properties) => {
    //     const randomProperties = await getMultipleRandomisedPropertyIds(
    //       properties
    //     );
    //     const user = await client.user.create({
    //       data: {
    //         ...userAccounts[index],
    //         profile: {
    //           create: {
    //             bio: faker.lorem.sentences(),
    //             superHost: false,
    //           },
    //         },
    //         properties: {
    //           connect: randomProperties,
    //         },
    //       },
    //     });
    //   });
  }
};

module.exports = {
  createUsers,
};
