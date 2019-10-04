const { Router } = require('express');
const { Users } = require('../../../models');
const mailer = require('../../../config/mailer');
const fixture = require('../../../models/user/__fixture__');
const request = require('../../../tests');
const route = require('../post');

let agent;
let id;
let password;

const mockCredentials = jest.fn();
jest.mock('../../../config/mailer');

beforeEach(() => {
  mockCredentials.mockImplementation((req, res, next) => {
    next();
  });
});

afterAll(async () => Users.deleteMany({}));

beforeAll(async () => {
  const app = Router();
  app.use(mockCredentials);
  app.post('/password-change', route);
  agent = await request(app);

  const doc = await Users.create(fixture);
  password = await doc.setPassword();
  ({ _id: id } = doc);
});

describe('password-reset /POST', () => {
  it('should return 422', async () =>
    agent.post('/password-change').expect(422));

  it('should return 204', async () => {
    mockCredentials.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.id = id;
      next();
    });
    await agent
      .post('/password-change')
      .send({
        previousPassword: password,
        newPassword: 'Th345iS)(*&(NJKSF!',
        confirmNewPassword: 'Th345iS)(*&(NJKSF!',
      })
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
