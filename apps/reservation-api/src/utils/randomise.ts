import { faker } from '@faker-js/faker';
type RandomisedItem = { id: number }
// interface RandomisedItems extends Array<RandomisedItem> { }
export const randomiseArray = (items: Array<RandomisedItem>, count?: number) => {
  return count
    ? faker.helpers.uniqueArray(items, count)
    : faker.helpers.arrayElement(items);
};

export function randomiseInt(max: number) {
  return Math.floor(Math.random() * max);
}

