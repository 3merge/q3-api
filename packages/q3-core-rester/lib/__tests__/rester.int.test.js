/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const express = require('express');
const supertest = require('supertest');
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
  restify: 'patch post get delete',
  collectionSingularName: 'foo',
  collectionPluralName: 'foos',
};

const SubChild = new Schema({ name: String });

const Child = new Schema({
  isChild: Boolean,
  subs: [SubChild],
});

const Base = new Schema(
  {
    hasChild: Boolean,
    children: [Child],
    documentPath: SubChild,
  },
  opts,
);

const BasePlus = new Schema({
  hasRoot: Boolean,
  childrenOfItsOwn: [Child],
});

const Foo = model('FOO', Base);
Foo.discriminator('FOO_EXTENDS', BasePlus);

beforeAll(async () => {
  app.use(config);
  rest.run();

  await mongoose.connect(process.env.CONNECTION);

  app.use((e, req, res, next) => {
    // eslint-disable-next-line
    console.log(e);
    res.status(500).send();
  });
});

describe('Rester init', () => {
  it('should return number of routes created', async () => {
    await request.get('/foos').expect(200);
  });
});
