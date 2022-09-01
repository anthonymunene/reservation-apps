const { getAllProperties, randomised } = require("./properties");
const { faker } = require("@faker-js/faker");

const isValidRating = (rating) => rating > 0 && rating < 5;

const createReview = async (client) => {
  const propertiesToReview = await getAllProperties(client);
  const addReview = async (user) => {
    const content = {
      data: {
        property: {
          connect:  randomised(propertiesToReview),
        },
        reviewer: {
          connect: user,
        },
        comment: faker.lorem.paragraphs(randomised(6)),
        rating: randomised(5),
      },
    };
    const review = await client.review.create(content);

    // console.log(JSON.stringify(content))

    return review
  };

  const users = await client.user.findMany({
    select: {
      id: true,
    },
  });

  await Promise.all(users.map((user) => addReview(user)));
};

module.exports = { createReview };
