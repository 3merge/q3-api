require('.');
const Q3 = require('q3-api');
const supertest = require('supertest');
const { seed, destroy } = require('./fixtures/stubs');

beforeAll(async () => {
  Q3.connect().then((e) => (e === null ? seed() : null));

  global.agent = supertest(Q3.$app);
});

afterAll(async () => {
  await destroy();
});
