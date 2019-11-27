const mongoose = require('mongoose');
const express = require('express');
const rester = require('..');

const app = express();
const { Schema, model } = mongoose;

const opts = {
  restify: 'update create read delete',
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

describe('Rester init', () => {
  it('should return number of routes created', () => {
    rester(app, mongoose).run();
  });
});
