const { Router } = require('express');
const { Users } = require('../../../models');
const fixture = require('../../../models/user/__fixture__');
const request = require('../../../tests');
const route = require('../post');

let agent;

beforeAll(async () => {
  agent = await request(
    Router().post('/authenticate', route),
  );

  await Users.create(fixture);
});

afterAll(async () => Users.deleteMany({}));

describe('authenticate /POST', () => {
  it('should return 422', async () =>
    agent.post('/authenticate').expect(422));

  it('should return 400', async () =>
    agent
      .post('/authenticate')
      .send({ email: fixture.email, password: 'noop' })
      .expect(400));

  it('should return 401', async () => {
    const { email } = fixture;
    const doc = await Users.findOne({ email });
    await doc.setPassword();
    await agent
      .post('/authenticate')
      .send({ email, password: 'noop' })
      .expect(401);
  });

  it('should return 403', async () => {
    const { email } = fixture;
    const doc = await Users.findOne({ email });
    doc.set({
      password: 'noop',
      loginAttempts: 10,
      verified: true,
    });
    await doc.save();
    await agent
      .post('/authenticate')
      .send({ email, password: 'noop' })
      .expect(403);
  });
});
