const supertest = require('supertest');
const { Users } = require('../../models');
const { MODEL_NAMES } = require('../../constants');
const fixture = require('../../models/user/__fixture__');
const Q3 = require('../..');

let agent;
let AuthorizationSuper;
let AuthorizationDeveloper;
const role = 'Developer';

const base = {
  ...fixture,
  verified: true,
  password: 'Sh!0978ydsn*1',
};

const args = {
  coll: MODEL_NAMES.PERMISSIONS,
  op: 'Update',
  fields: 'email, firstName, lastName, role',
  ownership: 'Any',
  role,
};

beforeAll(async () => {
  agent = supertest(Q3.$app);
  await Q3.connect();
  const [dev, sup] = await Users.create([
    { ...base, email: 'dever@net.com', role },
    base,
  ]);

  AuthorizationSuper = `ApiKey ${await sup.generateApiKey()}`;
  AuthorizationDeveloper = `ApiKey ${await dev.generateApiKey()}`;
});

afterAll(async () => {
  await Users.deleteMany({});
});

describe('permissions /POST', () => {
  it('should return 403', async () =>
    agent
      .post('/permissions')
      .send(args)
      .set({ Authorization: AuthorizationDeveloper })
      .expect(403));

  it('should return 201', async () =>
    agent
      .post('/permissions')
      .send(args)
      .set({ Authorization: AuthorizationSuper })
      .expect(201));

  it('should return 409', async () =>
    agent
      .post('/permissions')
      .send(args)
      .set({ Authorization: AuthorizationSuper })
      .expect(409));
});
