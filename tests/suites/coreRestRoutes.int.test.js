/* eslint-disable import/no-extraneous-dependencies */
jest.unmock('express-validator');

const Q3 = require('q3-api');
const supertest = require('supertest');
// const mongoose = require('mongoose');

const { Users, Permissions } = Q3;

let agent;
let id;
let password;
let AuthorizationSuper;

const email = 'routes_developer@gmail.com';

const getSource = async (userId) => {
  const { source } = await Users.findById(userId)
    .select('source')
    .lean()
    .exec();

  return source;
};

beforeAll(async () => {
  Q3.config({
    charts: {
      '123': ['Super'],
    },
  });
  Q3.routes();
  agent = supertest(Q3.$app);
  await Q3.connect();

  const sup = await Users.create({
    active: true,
    firstName: 'Mike',
    lastName: 'Ibberson',
    verified: true,
    password: 'Sh!0978ydsn*1',
    role: 'Super',
    email,
  });

  AuthorizationSuper = `Apikey ${await sup.generateApiKey()}`;
  ({ _id: id } = sup);

  await Permissions.create({
    coll: 'q3-api-users',
    op: 'Read',
  });
});

afterAll(async () => {
  // await Users.deleteMany({});
  // await mongoose.disconnect();
});

describe('authenticate /GET', () => {
  it('should return 422', () =>
    agent.get('/authenticate?email=foo').expect(422));

  it('should return 400', () =>
    agent
      .get('/authenticate?email=FOO@bar.net')
      .expect(400));

  it('should return 204', () =>
    agent.get(`/authenticate?email=${email}`).expect(204));
});

describe('authenticate /POST', () => {
  it('should return 422', () =>
    agent.post('/authenticate').expect(422));

  it('should return 401', () =>
    agent
      .post('/authenticate')
      .send({ email, password: 'noop' })
      .expect(401));

  it('should return 401', async () => {
    const doc = await Users.findOne({ email });
    await doc.setPassword();
    return agent
      .post('/authenticate')
      .send({ email, password: 'noop' })
      .expect(401);
  });

  it.skip('should return 200', async () => {
    const doc = await Users.findOne({ email });
    const p = await doc.setPassword();
    const { body } = await agent
      .post('/authenticate')
      .send({ email, password: p })
      .expect(201);

    expect(body).toHaveProperty('token');
    expect(body).toHaveProperty('nonce');
  });

  it.skip('should track devices', async () => {
    const doc = await Users.findOne({ email });
    const p = await doc.setPassword();
    await agent
      .post('/authenticate')
      .send({ email, password: p });

    expect(getSource(doc.id)).resolves.toHaveLength(1);

    await agent
      .post('/authenticate')
      .send({ email, password: p });

    expect(getSource(doc.id)).resolves.toHaveLength(1);
  });

  it('should return 403', async () => {
    const doc = await Users.findOne({ email });
    doc.set({
      password: 'noop',
      loginAttempts: 10,
      verified: true,
    });
    await doc.save();
    return agent
      .post('/authenticate')
      .send({ email, password: 'noop' })
      .expect(403);
  });
});

describe('password-reset /POST', () => {
  beforeEach(async () => {
    const doc = await Users.findById(id);
    return doc.setPassword();
  });

  it('should return 200', () =>
    agent
      .post('/password-reset')
      .send({ email })
      .expect(200));
});

describe('password-change /POST', () => {
  beforeEach(async () => {
    const doc = await Users.findById(id);
    password = await doc.setPassword();
  });

  it('should return 422', () =>
    agent.post('/password-change').expect(422));

  it('should return 204', () =>
    agent
      .post('/password-change')
      .send({
        previousPassword: password,
        newPassword: 'Th345iS)(*&(NJKSF!',
        confirmNewPassword: 'Th345iS)(*&(NJKSF!',
      })
      .set({ Authorization: AuthorizationSuper })
      .expect(204));
});

describe('profile /GET', () => {
  it('should return 401', () =>
    agent.get('/profile').expect(401));

  it('should return 200', () =>
    agent
      .get('/profile')
      .set({ Authorization: AuthorizationSuper })
      .expect(200));
});

describe('history /GET', () => {
  it('should return 200', async () => {
    await agent
      .patch('/profile')
      .set({ Authorization: AuthorizationSuper })
      .send({ firstName: 'Michael' })
      .expect(200);

    const {
      body: { versions },
    } = await agent
      .get(
        `/history?collectionName=q3-api-users&documentId=${id}`,
      )
      .set({ Authorization: AuthorizationSuper })
      .expect(200);

    expect(versions.length).toBeGreaterThan(0);
  });
});

describe('Search', () => {
  it('should yield distinct values', async () => {
    await Permissions.create([
      {
        coll: 'q3-api-users',
        op: 'Read',
        role: 'Super',
      },
      {
        coll: 'q3-api-users',
        op: 'Update',
        role: 'Dev',
      },
      {
        coll: 'q3-api-users',
        op: 'Create',
        role: 'Builder',
      },
      {
        coll: 'q3-api-permissions',
        op: 'Read',
        role: 'Super',
      },
      {
        coll: 'q3-api-permissions',
        op: 'Update',
        role: 'Dev',
      },
    ]);

    const { body } = await agent
      .get(
        '/search?collectionName=q3-api-permissions&fields[]=coll&fields[]=role',
      )
      .set({ Authorization: AuthorizationSuper })
      .expect(200);

    expect(body.fields.coll.length).toBeGreaterThan(1);
    expect(body.fields.role.length).toBeGreaterThan(1);

    const { body: filtered } = await agent
      .get(
        '/search?collectionName=q3-api-permissions&fields[]=coll&fields[]=role&role=Dev',
      )
      .set({ Authorization: AuthorizationSuper })
      .expect(200);

    expect(filtered.fields.coll).toHaveLength(2);
    expect(filtered.fields.role).toHaveLength(1);
    expect(filtered.total).toBe(2);
  });
});

describe('charts /GET', () => {
  beforeEach(() => {
    process.env.MONGODB_EMBEDDING_KEY = '123';
    process.env.MONGODB_EMBEDDING_BASE =
      'https://mongodb.com/charts';
  });

  it('should return 200', async () => {
    const {
      body: { url },
    } = await agent
      .get('/charts?id=123&branch')
      .set({ Authorization: AuthorizationSuper })
      .expect(200);

    expect(url).toMatch('mongodb.com');
    expect(url).toMatch('id=123');
    expect(url).toMatch('filter=');
  });
});

describe('statistics /GET', () => {
  it('should return 200', async () => {
    const { body } = await agent
      .get('/statistics?collectionName=q3-api-users')
      .set({ Authorization: AuthorizationSuper })
      .expect(200);

    expect(body).toHaveProperty('latest');
    expect(body).toHaveProperty('previous');
  });
});

describe('reverify /POST', () => {
  it('should return 400', () =>
    agent.post('/reverify').send({ email }).expect(400));

  it('should return 204', async () => {
    const doc = await Users.findById(id);
    doc.verified = false;
    doc.password = null;
    await doc.save();
    return agent
      .post('/reverify')
      .send({ email })
      .expect(204);
  });
});
