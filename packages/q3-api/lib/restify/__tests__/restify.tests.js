const mongoose = require('mongoose');
const supertest = require('supertest');
const { $app, User, connect } = require('../..');
const restify = require('..');

let agent;

beforeAll(async () => {
  const Sub = new mongoose.Schema({
    like: Boolean,
  });

  const Model = mongoose.model(
    'routers',
    new mongoose.Schema(
      {
        name: {
          type: String,
          required: true,
        },
        embeds: {
          type: [Sub],
        },
        embed: {
          type: Sub,
        },
      },
      {
        restify: 'get patch post delete',
        collectionPluralName: 'routers',
        collectionSingularName: 'router',
        collectionRestName: 'routers',
      },
    ),
  );

  // running by auth
  jest.spyOn(User, 'findByApiKey').mockResolvedValue({
    role: 'Super',
  });

  restify(Model);
  agent = supertest($app);
  await connect();
});

describe('Controller templates', () => {
  let id;

  it('GET', async () => {
    await agent.get('/routers').expect(200);
  });

  it('POST', async () => {
    await agent.post('/routers').expect(422);
    const { body } = await agent
      .post('/routers')
      .send({ name: 'Mike' })
      .expect(201);

    ({ id } = body.router);
  });

  it('GET by ID', async () => {
    await agent.get(`/routers/${id}`).expect(200);
  });

  it('PATCH', async () => {
    await agent
      .patch(`/routers/${id}`)
      .send({ name: 'Mark' })
      .expect(200);
  });

  it('DELETE', async () => {
    await agent.delete(`/routers/${id}`).expect(204);
  });
});
