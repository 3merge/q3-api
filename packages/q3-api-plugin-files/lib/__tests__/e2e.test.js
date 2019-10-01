// eslint-disable-next-line
require('dotenv').config();
const Q3 = require('q3-api').default;
const path = require('path');
const { Schema } = require('mongoose');
const supertest = require('supertest');
const schema = require('../schema');
const routes = require('../router');

let agent;
let id;

beforeAll(async () => {
  const app = Q3.init();
  const name = 'Demo';
  const base = new Schema({
    name: String,
  });

  base.plugin(schema, {
    featured: true,
  });

  const Model = Q3.setModel(name, base);

  app.get('/demo', (req, res) => res.ok());
  app.use('/demo', routes(name));

  agent = supertest(app);

  await Q3.connect();
  ({ _id: id } = await Model.create({
    name: 'Foo',
  }));
});

describe('GET', () => {
  it('should return 200 at root', (done) => {
    agent
      .get('/demo')
      .expect(200)
      .end(done);
  });
});

describe('POST to upload public files', () => {
  it('should return 201', async () => {
    const { status, body } = await agent
      .post(`/demo/${id}/public`)
      .attach(
        'photo',
        path.resolve(
          __dirname,
          '../__fixtures__/astronaut.png',
        ),
      );
    expect(status).toBe(201);
    expect(body.publicFiles).toHaveLength(1);
  });
});
