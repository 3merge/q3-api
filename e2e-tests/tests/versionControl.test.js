const Q3 = require('q3-api');
const supertest = require('supertest');
const setup = require('../fixtures');

let Authorization;
let agent;

beforeAll(async () => {
  const user = await setup();

  await user
    .set({
      secret: 'Shh!',
      verified: true,
    })
    .setPassword();

  Authorization = `Apikey ${await user.generateApiKey()}`;
  agent = supertest(Q3.$app);
});

describe('Version control plugin', () => {
  let id;

  const getStudentVersion = async () => {
    const {
      body: { versions },
    } = await agent
      .get(
        `/history?collectionName=students&documentId=${id}`,
      )
      .set({ Authorization })
      .expect(200);

    return versions;
  };

  it('should ignore on create payloads', async () => {
    ({
      body: {
        student: { id },
      },
    } = await agent
      .post('/students')
      .send({ name: 'George' })
      .set({ Authorization })
      .expect(201));

    return expect(
      getStudentVersion(),
    ).resolves.toHaveLength(0);
  });

  it('should ignore automated data changes', async () => {
    await agent
      .post(`/students/${id}/friends`)
      .send({ name: 'Barrie' })
      .set({ Authorization })
      .expect(201);

    const v = await getStudentVersion();

    expect(v).toHaveLength(1);
    expect(v[0].modified.friends).not.toHaveProperty(
      'createdAt',
    );

    expect(v[0].modified.friends).not.toHaveProperty('id');
  });
});
