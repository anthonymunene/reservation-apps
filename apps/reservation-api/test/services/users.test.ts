import { expect } from 'chai'
import app from '../../src/app';
import { faker } from '@faker-js/faker';
import {Profile, User } from '@prisma/client';


const cleanup = async (user: User) => {
  app.service('users').remove(user.id)
}
describe('\'users\' service', () => {
  it('registered the service', () => {
    const service = app.service('users');

    expect(service, 'Registered the service').to.be.ok;
  });

  it('creates a user', async () => {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const user = await app.service('users').create({
      email: faker.internet.email(firstName, lastName),
      firstName,
      lastName
    });
    after( async () => { 

      await cleanup(user)
    });
  });

  it('creates a user with a profile',async () => {
    
  })
});
