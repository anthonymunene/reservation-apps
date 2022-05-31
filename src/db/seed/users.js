const { faker } = require("@faker-js/faker");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const users = Array.from({ length: 10 }).map(() => ({
  email: faker.internet.email(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  profile: { create: { bio: faker.lorem.sentences() } },
}));

const createUser = async () => {
  users.forEach(
    async (user) =>
      await prisma.user.create({
        data: user,
      })
  );
};

module.exports = {
  createUser,
};
