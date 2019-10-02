// eslint-disable-next-line
require('dotenv').config();
const { Types } = require('mongoose');
const Q3 = require('q3-api').default;
const fs = require('fs');
const path = require('path');
const supertest = require('supertest');
const plugin = require('..');

const topic = Types.ObjectId().toString();
const file = fs.createReadStream(
  path.resolve(__dirname, '../__fixtures__/astronaut.png'),
);

let agent;
let id;

beforeAll(async () => {
  agent = supertest(Q3.init());
  Q3.register(plugin);
  await Q3.connect();
});

describe('POST to upload public files', () => {
  it('should return 201', async () => {
    const { status, body } = await agent
      .post('/files')
      .field('topic', topic)
      .field('model', 'Company')
      .field('sensitive', true)
      .attach('photo', file);

    expect(status).toBe(201);
    expect(body.files).toHaveLength(1);
    [{ id }] = body.files;
  });
});

describe('GET to upload public files', () => {
  it('should return 200', async () => {
    const { status, body } = await agent.get(
      `/files/${id}`,
    );

    expect(status).toBe(200);
    expect(body.url).toEqual(expect.any(String));
  });
});

describe('GET to upload public files', () => {
  it('should return 200', async () => {
    const { status, body } = await agent.get(
      `/files?topic=${topic}&sensitive=false`,
    );
    expect(status).toBe(200);
    expect(body.files).toHaveLength(0);
  });
});

describe('DELETE to remove file', () => {
  it('should return 204', async () => {
    const { status } = await agent.delete(`/files/${id}`);

    expect(status).toBe(204);
  });
});
