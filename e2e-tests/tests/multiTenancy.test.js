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
  await Q3.model('emails').deleteMany({});
  await Q3.model('domainresources').deleteMany({});
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
      lang: 'es',
    });

    await Q3.model('domains').create({
      active: true,
    });

    await Q3.model('emails').create([
      {
        name: '__en-header',
        mjml: 'testing',
        variables: {
          foo: 1,
        },
      },
      {
        name: '__es-header',
        mjml: 'keepsafe',
        variables: {
          foo: 1,
          bar: 1,
        },
      },
      {
        name: 'en-testing-template',
        mjml: 'testing2',
        variables: {},
      },
    ]);

    const {
      body: { domain },
    } = await agent
      .post('/domain')
      .set({ Authorization })
      .send({
        lng: 'es',
        brand: '3merge',
        supportedLngs: ['en', 'es'],
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
      brand: '3merge',
      lng: 'es',
      resources: {
        titles: {
          password: 'Password',
        },
      },
    });

    // one for default en
    // one for new es
    expect(
      Q3.model('domainresources').find(),
    ).resolves.toHaveLength(2);

    const allEmails = await Q3.model('emails').find();

    const expectEmailTemplateToMatch = (name, obj = {}) =>
      expect(
        allEmails.find((item) => item.name === name),
      ).toMatchObject(obj);

    expectEmailTemplateToMatch('__es-header', {
      name: '__es-header',
      mjml: 'keepsafe',
      variables: {
        foo: 1,
        bar: 1,
      },
    });

    expectEmailTemplateToMatch('es-testing-template', {
      name: 'es-testing-template',
      mjml: 'testing2',
      variables: {},
    });
  });
});
