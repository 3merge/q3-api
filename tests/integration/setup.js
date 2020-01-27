require('.');
const Q3 = require('q3-api');
const mongoose = require('mongoose');
const supertest = require('supertest');
const { seed, destroy } = require('./fixtures/stubs');

beforeAll(async () => {
  await Q3.connect().then((e) =>
    e === null ? seed() : null,
  );

  global.agent = supertest(Q3.$app);
});

afterAll(async () => {
  await mongoose.disconnect();
  await destroy();
});
