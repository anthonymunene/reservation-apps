//@ts-ignore
import { faker } from "@faker-js/faker"

type RandomisedItem = { id: string; name: string }

export function randomiseMany<T extends RandomisedItem>(items: T[], options?: { count?: number }): T[] {
  return faker.helpers.uniqueArray(items, options.count)
}

export function randomiseOne<T extends RandomisedItem>(items: T[]): T {
  return faker.helpers.arrayElement(items)
}

export function randomiseInt(max: number) {
  return Math.floor(Math.random() * max)
}
