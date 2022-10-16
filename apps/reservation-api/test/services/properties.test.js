const app = require('../../src/app');

describe('\'properties\' service', () => {
  it('registered the service', () => {
    const service = app.service('properties');
    expect(service).toBeTruthy();
  });
});
