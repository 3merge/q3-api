const express = require('express');
const supertest = require('supertest');
const walker = require('..');
const { mock } = require('../fixtures');
const {
  mock: nestedMock,
} = require('../fixtures/authenticate');

let agent;

beforeAll(() => {
  const app = express();
  app.use(walker('packages/q3-core-walker/fixtures'));
  agent = supertest(app);
});

beforeEach(() => {
  mock.mockReset();
  nestedMock.mockReset();
});

describe('walker', () => {
  it('should register GET', async () => {
    await agent.get('/').expect(200);
    expect(mock).toHaveBeenCalled();
    expect(nestedMock).not.toHaveBeenCalled();
  });

  it('should register nested POST', async () => {
    await agent.post('/authenticate').expect(200);
    expect(mock).toHaveBeenCalled();
    expect(nestedMock).toHaveBeenCalled();
  });

  it('should register nested ID GET', async () => {
    await agent.get('/authenticate/123').expect(200);
  });

  it('should leave unregistered routes as 404', async () => {
    await agent.get('/foo/123').expect(404);
  });
});
