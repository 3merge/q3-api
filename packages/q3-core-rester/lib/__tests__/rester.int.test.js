const mongoose = require('mongoose');
const express = require('express');
const supertest = require('supertest');
const rester = require('..');

// install middleware HERE

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

beforeAll(() => {
  rest.run();
  app.use((e, req, res, next) => {
    console.log(e);
    res.status(500).send();
  });
});

describe('Rester init', () => {
  it('should return number of routes created', async () => {
    await request.get('/foos').expect(200);
  });
});
