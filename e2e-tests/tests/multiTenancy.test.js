process.env.ARCHITECTURE = 'MULTITENANT';

const Q3 = require('q3-api');
const setup = require('../fixtures');
const { access, teardown } = require('../helpers');

let Authorization;
let agent;

beforeAll(async () => {
  ({ Authorization, agent } = await setup());
});

beforeEach(async () => {
  access.refresh();
  await Q3.model('domains').deleteMany({});
  await Q3.model('users').updateOne({
    tenant: undefined,
  });
});

afterEach(async () => {
  await Q3.model('students').deleteMany({});
});

afterAll(teardown);

describe('multi-tenancy', () => {
  it('should get domain', async () => {
    await Q3.model('domains').create({
      active: true,
    });

    await agent
      .get('/domain')
      .set({ Authorization })
      .expect(200);
  });

  it('cannot take mixed tenants', async () => {
    await Q3.model('domains').create({
      active: true,
    });

    await agent
      .get('/domain')
      .set({
        Authorization,
        'x-session-tenant': 'test',
      })
      .expect(400);
  });

  it('should fail to get domain', async () => {
    await Q3.model('users').updateOne({
      tenant: 'test',
    });

    await Q3.model('domains').create({
      active: true,
    });

    await agent
      .get('/domain')
      .set({
        Authorization,
        'x-session-tenant': 'test',
      })
      .expect(400);
  });

  it('should get domain by tenant', async () => {
    await Q3.model('users').updateOne({
      tenant: 'test',
    });

    await Q3.model('domains').create({
      active: true,
      tenant: 'test',
    });

    await agent
      .get('/domain')
      .set({
        Authorization,
        'x-session-tenant': 'test',
      })
      .expect(200);
  });

  it('should assign tenant to all new records', async () => {
    await Q3.model('users').updateOne({
      tenant: 'test',
    });

    await Q3.model('domains').create({
      active: true,
      tenant: 'test',
    });

    const {
      body: { student },
    } = await agent
      .post('/students')
      .set({
        Authorization,
        'x-session-tenant': 'test',
      })
      .send({
        name: 'John',
      })
      .expect(201);

    expect(student.tenant).toBeUndefined();

    await agent
      .get(`/students/${student.id}`)
      .set({
        Authorization,
        'x-session-tenant': 'test',
      })
      .expect(200);

    await Q3.model('users').updateOne({
      tenant: 'test2',
    });

    await Q3.model('domains').updateOne({
      tenant: 'test2',
    });

    await agent
      .get(`/students/${student.id}`)
      .set({
        Authorization,
        'x-session-tenant': 'test2',
      })
      .expect(404);
  });

  it('should modify domain', async () => {
    await Q3.model('users').updateOne({
      tenant: null,
      lang: 'fr',
    });

    await Q3.model('domains').create({
      active: true,
      lng: 'fr',
    });

    const {
      body: { domain },
    } = await agent
      .post('/domain')
      .set({ Authorization })
      .send({
        lng: 'es',
        brand: '3merge',
        resources: {
          titles: {
            password: 'Password',
          },
        },
      })
      .expect(200);

    const {
      body: { domain: domain2 },
    } = await agent
      .get('/domain')
      .set({ Authorization })
      .expect(200);

    expect(domain).toMatchObject(domain2);
    expect(domain).toMatchObject({
      lng: 'fr',
      brand: '3merge',
      resources: {
        titles: {
          password: 'Password',
        },
      },
    });
  });
});
