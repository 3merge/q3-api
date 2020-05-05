require('../fixtures/student');

const Q3 = require('q3-api');
const supertest = require('supertest');
const mongoose = require('mongoose');
const { genUser } = require('../fixtures');

let Authorization;
let agent;

beforeAll(async () => {
  Q3.config({
    grants: [
      {
        coll: 'students',
      },
    ],
  });

  Q3.routes();

  await mongoose.connect(process.env.CONNECTION);

  const d = await genUser();
  await d
    .set({
      secret: 'Shh!',
      verified: true,
    })
    .setPassword();

  Authorization = `Apikey ${await d.generateApiKey()}`;
  agent = supertest(Q3.$app);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Version control plugin', () => {
  it('should ignore automated field changes', async () => {
    const d = await agent
      .post('/students')
      .send({ name: 'George' })
      .set({ Authorization })
      .expect(201);
  });
});
