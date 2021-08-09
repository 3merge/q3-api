jest.setTimeout(30000);

// eslint-disable-next-line
const { map, first, last, get } = require('lodash');
const mongoose = require('mongoose');
// eslint-disable-next-line
const changelog = require('q3-plugin-changelog/lib/changestream');
const setup = require('../fixtures');
const Students = require('../fixtures/models/student');
const { delay, teardown } = require('../helpers');

let Authorization;
let agent;

const deleteMany = (collectionName) =>
  mongoose.connection.db
    .collection(collectionName)
    .deleteMany({});

const getChanges = async (id) => {
  await delay(150);

  const {
    body: { changes },
  } = await agent
    .get(`/audit?collectionName=students&id=${id}`)
    .set({ Authorization })
    .expect(200);

  return changes;
};

afterAll(teardown);

beforeAll(async () => {
  ({ Authorization, agent } = await setup(
    'developer@3merge.ca',
    'Developer',
  ));

  await changelog();
});

afterEach(async () => {
  await deleteMany('students');
  await deleteMany('students-changelog-v2');
});

describe('Changelog plugin', () => {
  it('should 404 on unknown document', async () =>
    agent
      .get(
        `/audit?collectionName=students&id=${mongoose.Types.ObjectId().toString()}`,
      )
      .set({ Authorization })
      .expect(404));

  it('should track new document changes', async () => {
    const {
      body: {
        student: { id },
      },
    } = await agent
      .post('/students')
      .send({ age: 21 })
      .set({ Authorization })
      .expect(201);

    await agent
      .patch(`/students/${id}`)
      .set({ Authorization })
      .send({ age: 36 })
      .expect(200);

    const changes = await getChanges(id);

    expect(changes).toHaveLength(2);
    expect(first(changes)).toHaveProperty('updated.age');
    expect(last(changes)).toHaveProperty('added.age');
  });

  it('should track system changes', async () => {
    const {
      body: {
        student: { id },
      },
    } = await agent
      .post('/students')
      .send({ name: 'Tom' })
      .set({ Authorization })
      .expect(201);

    await Students.updateMany(
      {},
      {
        name: 'Jerry',
      },
    );

    const changes = await getChanges(id);

    expect(changes).toHaveLength(2);
    expect(first(changes).user).toEqual({});
    expect(last(changes).user).toHaveProperty('firstName');
  });

  it('should track sub-document changes', async () => {
    const {
      body: {
        student: { id },
      },
    } = await agent
      .post('/students')
      .send({ name: 'Tom' })
      .set({ Authorization })
      .expect(201);

    const {
      body: {
        samples: [{ id: sampleId }],
      },
    } = await agent
      .post(`/students/${id}/samples`)
      .send({ test: 'foo' })
      .set({ Authorization })
      .expect(201);

    await delay(150);

    await agent
      .patch(`/students/${id}/samples/${sampleId}`)
      .send({ test: 'Bar' })
      .set({ Authorization })
      .expect(200);

    await delay(150);
    const changes = await getChanges(id);
    expect(changes).toHaveLength(3);

    expect(
      changes.every((item) => item.user._id),
    ).toBeTruthy();

    expect(first(changes).updated).toHaveProperty(
      'samples',
      expect.objectContaining({
        test: 'Bar',
      }),
    );
  });

  it('should track multi sub-document changes separately', async () => {
    const {
      body: {
        student: { id },
      },
    } = await agent
      .post('/students')
      .send({ name: 'Tom' })
      .set({ Authorization })
      .expect(201);

    await agent
      .post(`/students/${id}/samples`)
      .send({ test: 'foo' })
      .set({ Authorization })
      .expect(201);

    const {
      body: {
        samples: [{ id: sampleId }, { id: sampleId2 }],
      },
    } = await agent
      .post(`/students/${id}/samples`)
      .send({ test: 'bar' })
      .set({ Authorization })
      .expect(201);

    await delay(150);

    await agent
      .patch(`/students/${id}/samples`)
      .query({
        ids: [sampleId, sampleId2],
      })
      .send({ test: 'Quuz' })
      .set({ Authorization })
      .expect(200);

    await delay(150);
    expect(await getChanges(id)).toHaveLength(5);
  });

  it('should block public access', async () =>
    agent
      .get('/audit?collectionName=students')
      .expect(401));
});
