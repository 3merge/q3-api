const supertest = require('supertest');
const Q3 = require('../..');
const { Users } = require('../../models');

let agent;
let id;
let password;
let AuthorizationSuper;

const email = 'developer@gmail.com';

jest.unmock('request-context');

beforeAll(async () => {
  Q3.routes();

  agent = supertest(Q3.$app);
  await Q3.connect();
  const sup = await Users.findOneOrCreate(
    {
      email,
      firstName: 'Mike',
      lastName: 'Ibberson',
      verified: true,
      password: 'Sh!0978ydsn*1',
      role: 'Super',
    },
    {
      bypassAuthorization: true,
    },
  );

  AuthorizationSuper = `Apikey ${await sup.generateApiKey()}`;
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
    agent.get(`/authenticate?email=${email}`).expect(204));
});

describe('authenticate /POST', () => {
  it('should return 422', async () =>
    agent.post('/authenticate').expect(422));

  it('should return 401', async () =>
    agent
      .post('/authenticate')
      .send({ email, password: 'noop' })
      .expect(401));

  it('should return 401', async () => {
    const doc = await Users.findOne({ email });
    await doc.setPassword();
    await agent
      .post('/authenticate')
      .send({ email, password: 'noop' })
      .expect(401);
  });

  it('should return 403', async () => {
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
      .send({ email })
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
      .send({ email })
      .expect(400));

  it('should return 204', async () => {
    const doc = await Users.findById(id);
    doc.verified = false;
    doc.password = null;
    await doc.save();
    await agent
      .post('/reverify')
      .send({ email })
      .expect(204);
  });
});
