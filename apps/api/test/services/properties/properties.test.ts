// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert';
import { app } from '../../../src/app';
import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';

describe('properties service', () => {
  it('registered the service', () => {
    const service = app.service('properties');

    assert.ok(service, 'Registered the service');
  });
  // TODO: fix resolver error

  // it('creates a new property', async () => {
  //   const property = await app.service('properties').create({
  //     id: randomUUID(),
  //     title: faker.word.adjective(7),
  //     description: faker.lorem.sentences(),
  //     city: faker.address.city(),
  //     countryCode: faker.address.countryCode(),
  //     bedrooms: faker.helpers.arrayElement([1, 2, 3]),
  //     beds: faker.helpers.arrayElement([1, 2, 3]),
  //   });
  //   assert.ok(property, 'Success Created User');
  // });
});
