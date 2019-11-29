/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const express = require('express');
const i18next = require('i18next');
const supertest = require('supertest');
const parser = require('body-parser');
const { middleware } = require('q3-core-composer');
const rester = require('..');

const config = middleware(
  {
    findbyBearerToken: jest.fn().mockResolvedValue({
      id: mongoose.Types.ObjectId(),
      role: 'Super',
    }),
  },
  {
    hasGrant: jest.fn().mockResolvedValue({
      fields: '*',
    }),
  },
);

const app = express();
const rest = rester(app, mongoose).init();
const request = supertest(app);

const { Schema, model } = mongoose;

const opts = {
  restify: '*',
  collectionSingularName: 'foo',
  collectionPluralName: 'foos',
};

const SubChild = new Schema({
  name: { type: String, searchable: true },
});

const Child = new Schema({
  isChild: Boolean,
  subs: [SubChild],
});

const Base = new Schema(
  {
    hasChild: Boolean,
    children: [Child],
    documentPath: SubChild,
    name: {
      type: String,
      searchable: true,
      required: true,
    },
    age: {
      type: Number,
    },
  },
  opts,
);

const BasePlus = new Schema({
  hasRoot: Boolean,
  childrenOfItsOwn: [Child],
});

const Foo = model('FOO', Base);
const FooPlus = Foo.discriminator('FOO_EXTENDS', BasePlus);

beforeAll(async () => {
  i18next.init({ preload: ['en'] });

  app.use(config);
  app.use(parser.json());
  rest.run();

  await mongoose.connect(process.env.CONNECTION);

  await Foo.create([
    {
      name: 'Greg',
      documentPath: { name: 'Blue' },
      children: [
        { isChild: true, subs: [{ isChild: false }] },
      ],
    },
    {
      name: 'Holly',
      documentPath: { name: 'Green' },
      children: [
        { isChild: true, subs: [{ isChild: false }] },
      ],
    },
  ]);

  await FooPlus.create([
    {
      name: 'Alex',
      documentPath: { name: 'Red' },
      children: [
        { isChild: false, subs: [{ isChild: true }] },
      ],
    },
  ]);

  app.use((e, req, res, next) => {
    // eslint-disable-next-line
    // console.log(e);
    res.status(500).json(e);
  });
});

describe('Rester', () => {
  it('should list documents in the collection', async () => {
    const {
      body: { foos, total },
      status,
    } = await request.get('/foos?limit=2');
    expect(total).toBe(3);
    expect(foos).toHaveLength(2);
    expect(status).toBe(200);
  });

  it('should handle query strings', async () => {
    const {
      body: { foos, total },
      status,
    } = await request.get('/foos?search=green');
    expect(total).toBe(1);
    expect(foos).toHaveLength(1);
    expect(status).toBe(200);
  });

  it('should get resource by ID', async () => {
    const { id } = await Foo.findOne().exec();
    const {
      body: { foo },
      status,
    } = await request.get(`/foos/${id}`);
    expect(foo).toHaveProperty('id', id);
    expect(status).toBe(200);
  });

  it('should get resource by ID', async () => {
    const { id } = await Foo.findOne().exec();
    const {
      body: { foo },
      status,
    } = await request.get(`/foos/${id}`);
    expect(foo).toHaveProperty('id', id);
    expect(status).toBe(200);
  });

  it('should delete a single resource', async () => {
    const { id } = await Foo.findOne().exec();
    const { status } = await request.delete(`/foos/${id}`);
    expect(status).toBe(204);
  });

  it('should delete all resources', async () => {
    const docs = await Foo.find().exec();
    const ids = docs
      .map(({ _id }) => `ids[]=${_id}`)
      .join('&');

    const { status } = await request.delete(`/foos?${ids}`);
    expect(status).toBe(204);
  });

  it('should make a new resource', async () => {
    const { body, status } = await request
      .post('/foos')
      .send({
        name: 'Colin',
      });

    expect(status).toBe(201);
    expect(body).toHaveProperty('foo');
  });

  it('should fail to make a new resource', async () => {
    const { body, status } = await request
      .post('/foos')
      .send();

    expect(body).toHaveProperty(
      'errors',
      expect.any(Object),
    );

    expect(status).toBe(500);
  });

  it('should update the resource', async () => {
    const { id } = await Foo.findOne({
      active: true,
    }).exec();
    const { body, status } = await request
      .patch(`/foos/${id}`)
      .send({
        age: 22,
      });

    expect(status).toBe(200);
    expect(body).toHaveProperty('foo');
    expect(body.foo.age).toBe(22);
  });
});
