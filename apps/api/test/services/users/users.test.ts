// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert';
import { app } from '../../../src/app';
import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';

describe('users service', () => {
  it('registered the service', () => {
    const service = app.service('users');

    assert.ok(service, 'Registered the service');
  });
  it('creates a new user', async () => {
    const email = faker.internet.email();
    const user = await app.service('users').create({
      id: randomUUID(),
      email: email,
      password: faker.internet.password(),
    });
    assert.ok(user, 'Success Created User');
  });
});
