// 👇️ ts-nocheck disables type checking for entire file
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { getAllProperties } from './properties';
import { randomiseArray, randomiseInt } from '../../utils/randomise';
import { faker } from '@faker-js/faker';
import { Prisma, PrismaClient } from '@prisma/client';

const isValidRating = (rating:number) => rating > 0 && rating < 5;

export const createReview = async (client: PrismaClient) => {
  const propertiesToReview = await getAllProperties(client);
  const addReview = async (user) => {
    const content = {
      data: {
        property: {
          connect: randomiseArray(propertiesToReview),
        },
        reviewer: {
          connect: user,
        },
        comment: faker.lorem.paragraphs(6),
        rating: randomiseInt(5),
      },
    };
    const review = await client.review.create(content);

    // console.log(JSON.stringify(content))

    return review;
  };

  const users = await client.user.findMany({
    select: {
      id: true,
    },
  });

  await Promise.all(users.map((user) => addReview(user)));
};
