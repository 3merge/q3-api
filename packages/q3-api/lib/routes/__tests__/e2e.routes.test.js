const supertest = require('supertest');
const { Users } = require('../../models');
const fixture = require('../../models/user/__fixture__');
const mailer = require('../../config/mailer');
const Q3 = require('../..');

let agent;
let id;
let password;
let Authorization;

jest.mock('../../config/mailer');

beforeAll(async () => {
  agent = supertest(Q3.$app);
  await Q3.connect();
  const doc = await Users.create(fixture);
  Authorization = `ApiKey ${await doc.generateApiKey()}`;
  ({ _id: id } = doc);
});

afterAll(async () => {
  await Users.deleteMany({});
});

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

describe('password-reset /POST', () => {
  beforeAll(async () => {
    const doc = await Users.findById(id);
    await doc.setPassword();
  });

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

describe('password-change /POST', () => {
  beforeAll(async () => {
    const doc = await Users.findById(id);
    password = await doc.setPassword();
  });

  it('should return 422', async () =>
    agent.post('/password-change').expect(422));

  it('should return 204', async () => {
    await agent
      .post('/password-change')
      .send({
        previousPassword: password,
        newPassword: 'Th345iS)(*&(NJKSF!',
        confirmNewPassword: 'Th345iS)(*&(NJKSF!',
      })
      .set({ Authorization })
      .expect(204);
    expect(mailer).toHaveBeenCalled();
  });

  it('should return 401', async () =>
    agent
      .post('/password-change')
      .send({
        previousPassword: 'hey',
        newPassword: 'pass!',
        confirmNewPassword: 'pass!',
      })
      .expect(401));
});

describe('profile /GET', () => {
  it('should return 401', async () =>
    agent.get('/profile').expect(401));

  it('should return 200', async () =>
    agent
      .get('/profile')
      .set({ Authorization })
      .expect(200));
});
