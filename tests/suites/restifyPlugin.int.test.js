/* eslint-disable import/no-extraneous-dependencies, no-unused-vars */
jest.unmock('express-validator');

const mongoose = require('mongoose');
const express = require('express');
const i18next = require('i18next');
const supertest = require('supertest');
const i18nextMiddleware = require('i18next-express-middleware');
const parser = require('body-parser');
const { middleware } = require('q3-core-composer');
const rester = require('q3-core-rest');

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
      readOnly: '*',
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
  term: String,
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
  i18next
    .use(i18nextMiddleware.LanguageDetector)
    .init({ fallbackLng: 'en', preload: ['en'] });

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

afterAll(async () => {
  await mongoose.disconnect();
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
    const { status, body } = await request
      .post('/foos')
      .send({
        name: "What's in a name",
      });
    expect(status).toBe(201);
    expect(body).toHaveProperty('foo');
    expect(body.foo).toHaveProperty(
      'name',
      "What's in a name",
    );
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

  describe('Sub-controllers', () => {
    let id;

    beforeAll(async () => {
      ({ id } = await Foo.create({
        active: true,
        name: 'SubRouting',
        children: [
          { isChild: true, term: 'Hello' },
          { isChild: true, term: 'World' },
          { isChild: false },
        ],
      }));
    });

    it('should fetch sub-documents', async () => {
      const { body, status } = await request.get(
        `/foos/${id}/children`,
      );

      expect(body.children).toHaveLength(3);
    });

    it('should query sub-documents', async () => {
      const { body, status } = await request.get(
        `/foos/${id}/children?isChild=true&term=/hello/gi&sort=term`,
      );

      expect(body.children).toHaveLength(1);
    });

    it('should update multiple sub-documents', async () => {
      const doc = await Foo.findById(id).exec();
      const ids = doc.children
        .map((c) => `ids[]=${c.id}`)
        .join('&');
      const term = 'Updated!';

      const { body, status } = await request
        .patch(`/foos/${id}/children?${ids}`)
        .send({
          term,
        });

      expect(status).toBe(200);
      expect(
        body.children.every((c) => c.term === term),
      ).toBeTruthy();
    });
  });
});
