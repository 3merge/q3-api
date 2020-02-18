/* eslint-disable import/no-extraneous-dependencies */
jest.unmock('request-context');
jest.unmock('express-validator');

const mongoose = require('mongoose');
const { setModel } = require('q3-api');

const Schema = new mongoose.Schema(
  {
    name: String,
  },
  {
    restify: '*',
    collectionSingularName: 'sample',
    collectionPluralName: 'samples',
    withNotes: true,
  },
);

const coll = 'samples';
const Sample = setModel(coll, Schema);

const Q3 = require('q3-api');

const setupSession = require('../helpers/setupSession');
const setupSupertest = require('../helpers/setupSupertest');

let id;
let Authorization;
let agent;

beforeAll(async () => {
  Q3.routes();
  agent = await setupSupertest();

  Authorization = await setupSession([
    { op: 'Read', coll },
    { op: 'Create', coll },
    { op: 'Update', coll },
  ]);

  ({ _id: id } = await Sample.create({
    name: 'Testing',
  }));
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('authenticate /GET', () => {
  it('should return author', async () => {
    await agent
      .post(`/samples/${id}/thread`)
      .send({ message: 'Test' })
      .set({ Authorization })
      .expect(201);

    const { body } = await agent
      .get(`/samples/${id}/thread`)
      .set({ Authorization })
      .expect(200);

    expect(body.thread[0].createdBy).toHaveProperty(
      'firstName',
    );
  });
});
