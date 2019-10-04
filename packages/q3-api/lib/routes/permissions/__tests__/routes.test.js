const Q3 = require('q3-api');
const supertest = require('supertest');
const { Types } = require('mongoose');
const plugin = require('../..');
const { MODEL_NAME } = require('../../constants');
const seed = require('../../model/__fixture__');

let agent;
let docID;

afterAll(async () => Q3.model(MODEL_NAME).deleteMany({}));

beforeAll(async () => {
  process.env.PORT = 8222;
  agent = supertest(Q3.$app);
  Q3.register((app) => {
    app.use((req, res, next) => {
      req.user = {};
      req.user.id = Types.ObjectId();
      req.user.role = 'Super';
      next();
    });
  });

  Q3.register(plugin);
  await Q3.connect();
  [{ _id: docID }] = await Q3.model(MODEL_NAME).create(
    seed,
  );
});

afterAll(() => {
  Q3.$app.close();
});

describe('Get requests', () => {
  it('should fetch all permissions', async () =>
    agent.get('/permissions').expect(({ status, body }) => {
      expect(status).toBe(200);
      expect(body.permissions).toHaveLength(seed.length);
    }));

  it('should fetch by role', async () =>
    agent
      .get('/permissions?role=Developer')
      .expect(({ status, body }) => {
        expect(status).toBe(200);
        expect(body.permissions).toHaveLength(
          seed.filter(({ role }) => role === 'Developer')
            .length,
        );
      }));

  it('should fetch by collection', async () =>
    agent
      .get('/permissions?coll=Products')
      .expect(({ status, body }) => {
        expect(status).toBe(200);
        expect(body.permissions).toHaveLength(
          seed.filter(({ coll }) => coll === 'Products')
            .length,
        );
      }));

  it('should return 404', async () =>
    agent
      .get(`/permissions/${Types.ObjectId()}`)
      .expect(404));

  it('should return 200', async () =>
    agent
      .get(`/permissions/${docID}`)
      .expect(({ status, body }) => {
        expect(status).toBe(200);
        expect(body.permission).toHaveProperty('id');
      }));
});

describe('Update request', () => {
  it('should return 200', async () =>
    agent
      .patch(`/permissions/${docID}`)
      .send({ fields: '*, !sku', ownership: 'Any' })
      .expect(({ status, body }) => {
        expect(status).toBe(200);
        expect(body.permission.ownership).toMatch('Any');
        expect(body.permission.fields).toMatch('*, !sku');
      }));
});

describe('Delete request', () => {
  it('should return 204', async () =>
    agent.delete(`/permissions/${docID}`).expect(204));
});

describe('Post request', () => {
  it('should return 409 on duplicate', async () =>
    agent
      .post('/permissions')
      .send(seed[1])
      .expect(409));

  it('should return 201', async () =>
    agent
      .post('/permissions')
      .send({
        op: 'Create',
        coll: 'Events',
        role: 'Supervisor',
        fields: '*',
        ownership: 'Any',
      })
      .expect(201));
});
