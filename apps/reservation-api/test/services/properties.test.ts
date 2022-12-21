import app from '../../src/app';
import {expect} from 'chai'
import assert from 'assert'

describe('\'properties\' service', () => {
  it('registered the service', () => {
    const service = app.service('properties');
    assert.ok(service, 'Registered the service');
  });
});
