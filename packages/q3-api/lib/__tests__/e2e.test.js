const supertest = require('supertest');
const Q3 = require('../..');
const { Users } = require('../models');
const fixture = require('../models/user/__fixture__');
const { MODEL_NAMES } = require('../constants');

let agent;
let id;
let password;
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
  const sup = await Users.findOneOrCreate(
    { ...base, role: 'Super' },
    {
      bypassAuthorization: true,
    },
  );
  const dev = await Users.findOneOrCreate(
    {
      ...base,
      email: 'dever@net.com',
      role,
    },
    {
      bypassAuthorization: true,
    },
  );

  AuthorizationSuper = `ApiKey ${await sup.generateApiKey()}`;
  AuthorizationDeveloper = `ApiKey ${await dev.generateApiKey()}`;
  ({ _id: id } = sup);
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

  it('should return 401', async () =>
    agent
      .post('/authenticate')
      .send({ email: fixture.email, password: 'noop' })
      .expect(401));

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

  it('should return 200', async () => {
    await agent
      .post('/password-reset')
      .send(fixture)
      .expect(200);
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
      .set({ Authorization: AuthorizationSuper })
      .expect(204);
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
      .set({ Authorization: AuthorizationSuper })
      .expect(200));
});

describe('reverify /POST', () => {
  it('should return 400', async () =>
    agent
      .post('/reverify')
      .send({ email: fixture.email })
      .expect(400));

  it('should return 204', async () => {
    const doc = await Users.findById(id);
    doc.verified = false;
    doc.password = null;
    await doc.save();
    await agent
      .post('/reverify')
      .send({ email: fixture.email })
      .expect(204);
  });
});

describe('permissions /POST', () => {
  beforeAll(async () => {
    const doc = await Users.findById(id);
    doc.verified = true;
    await doc.save();
  });

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
