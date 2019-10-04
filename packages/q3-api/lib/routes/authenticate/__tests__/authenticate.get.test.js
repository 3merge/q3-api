const { Router } = require('express');
const { Users } = require('../../../models');
const fixture = require('../../../models/user/__fixture__');
const request = require('../../../tests');
const route = require('../get');

let agent;

beforeAll(async () => {
  agent = await request(
    Router().get('/authenticate', route),
  );

  await Users.create(fixture);
});

afterAll(async () => Users.deleteMany({}));

describe('authenticate /GET', () => {
  it('should return 422', async () =>
    agent.get('/authenticate?email=foo').expect(422));

  it('should return 400', async () =>
    agent
      .get('/authenticate?email=foo@bar.net')
      .expect(400));

  it('should return 204', async () =>
    agent
      .get(`/authenticate?email=${fixture.email}`)
      .expect(204));
});
