const express = require('express');
const supertest = require('supertest');
const walker = require('..');

let agent;

beforeAll(() => {
  const app = express();
  app.use(walker('packages/q3-core-walker/fixtures'));
  agent = supertest(app);
});

describe('walker', () => {
  it('should register GET', async () =>
    agent.get('/').expect(200));

  it('should register nested POST', async () =>
    agent.post('/authenticate').expect(200));

  it('should register nested ID GET', async () =>
    agent.get('/authenticate/123').expect(200));

  it('should leave unregistered routes as 404', async () =>
    agent.get('/foo/123').expect(404));
});
