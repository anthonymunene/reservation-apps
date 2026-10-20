import { faker } from "@faker-js/faker"

type RandomisedItem = { id: string; name: string }

// Picks `count` different items at random (all of them, shuffled, when no count is given)
export function randomiseMany<T>(items: T[], options?: { count?: number }): T[] {
  return faker.helpers.uniqueArray(items, options?.count ?? items.length)
}

export function randomiseOne<T extends RandomisedItem>(items: T[]): T {
  return faker.helpers.arrayElement(items)
}

export function randomiseInt(max: number) {
  return Math.floor(Math.random() * max)
}
