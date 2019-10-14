const Q3 = require('q3-api');
const request = require('supertest');
const { Types } = require('mongoose');
const { Schema } = require('mongoose');
const plugin = require('../../model');
const fixture = require('../../model/__fixture');
const routes = require('..');

let agent;
let documentID;
let addressID;

const genID = () => Types.ObjectId().toString();

const name = 'Foobar';
const Foo = new Schema({
  date: Date,
});

beforeAll(async () => {
  Foo.plugin(plugin);
  Q3.setModel(name, Foo);

  Q3.$app.use(
    '/foo',
    (req, res, next) => {
      req.authorization = jest.fn().mockResolvedValue({
        fields: '*',
      });

      req.user = {
        _id: genID(),
        role: 'Super',
      };

      next();
    },
    routes(name),
  );
  agent = request(Q3.$app);
  await Q3.connect();
});

beforeEach(async () => {
  ({
    _id: documentID,
    addresses: [{ _id: addressID }],
  } = await Q3.model(name).create({
    date: new Date(),
    addresses: [fixture],
  }));
});

describe('POST', () => {
  it('should return 404', async () =>
    agent
      .post(`/foo/${genID()}/addresses`)
      .send(fixture)
      .expect(404));

  it('should return 201', async () =>
    agent
      .post(`/foo/${documentID}/addresses`)
      .send({
        ...fixture,
        kind: 'Shipping',
      })
      .expect(201));
});

describe('PUT', () => {
  it('should return 200', async () =>
    agent
      .put(`/foo/${documentID}/addresses/${addressID}`)
      .send(fixture)
      .expect(200));

  it('should return 404', async () =>
    agent
      .post(`/foo/${documentID}/addresses/${genID()}`)
      .send(fixture)
      .expect(404));
});

describe('GET', () => {
  it('should return 200', async () =>
    agent.get(`/foo/${documentID}/addresses`).expect(200));
});

describe('DELETE', () => {
  it('should return 422', async () =>
    agent.delete('/foo/123/addresses').expect(422));

  it('should return 500', async () =>
    agent
      .delete(
        `/foo/${documentID}/addresses?ids[]=${genID()}`,
      )
      .expect(500));

  it('should return 204', async () =>
    agent
      .delete(
        `/foo/${documentID}/addresses?ids[]=${addressID}`,
      )
      .expect(204));

  it('should return 204', async () =>
    agent
      .delete(`/foo/${documentID}/addresses/${addressID}`)
      .expect(204));
});
