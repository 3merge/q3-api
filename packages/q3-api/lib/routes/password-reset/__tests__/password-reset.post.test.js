const { Router } = require('express');
const { Users } = require('../../../models');
const mailer = require('../../../config/mailer');
const fixture = require('../../../models/user/__fixture__');
const request = require('../../../tests');
const route = require('../post');

let agent;
jest.mock('../../../config/mailer');
afterAll(async () => Users.deleteMany({}));

beforeAll(async () => {
  agent = await request(
    Router().post('/password-reset', route),
  );

  const doc = await Users.create(fixture);
  await doc.setPassword();
});

describe('password-reset /POST', () => {
  it('should return 422', async () =>
    agent.post('/password-reset').expect(422));

  it('should return 400', async () =>
    agent
      .post('/password-reset')
      .send({ email: 'unknown@gmail.com' })
      .expect(400));

  it('should return 204', async () => {
    await agent
      .post('/password-reset')
      .send(fixture)
      .expect(204);
    expect(mailer).toHaveBeenCalled();
  });
});
