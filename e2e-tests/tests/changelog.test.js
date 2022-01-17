jest.setTimeout(30000);

// eslint-disable-next-line
const {
  map,
  first,
  last,
  get,
  isString,
} = require('lodash');
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

const getChanges = async (id, targets) => {
  await delay(1000);

  const {
    body: { changes },
  } = await agent
    .get(
      `/audit?collectionName=students&id=${id}&targets=${targets}`,
    )
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
  it('should track new document changes', async () => {
    const {
      body: {
        student: { id },
      },
    } = await agent
      .post('/students')
      .send({ name: 'Jerry', class: 'Bio', age: 21 })
      .set({ Authorization })
      .expect(201);

    await delay(1000);
    await Students.updateMany(
      {},
      {
        age: 31,
      },
    );

    await delay(1000);
    await agent
      .patch(`/students/${id}`)
      .set({ Authorization })
      .send({ class: 'Economics', age: 36 })
      .expect(200);

    const changes = await getChanges(id, 'class,age');
    expect(changes).toHaveLength(3);

    expect(changes).toEqual([
      {
        updates: [
          {
            class: 'Economics',
            age: 36,
          },
        ],
        date: expect.any(String),
        user: 'Mike Ibberson',
      },
      {
        updates: [
          {
            class: 'Bio',
            age: 31,
          },
        ],
        date: expect.any(String),
        user: null,
      },
      {
        additions: [
          {
            class: 'Bio',
            age: 21,
          },
        ],
        date: expect.any(String),
        user: 'Mike Ibberson',
      },
    ]);
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

    await delay(1000);

    const {
      body: {
        samples: [{ id: sampleId }],
      },
    } = await agent
      .post(`/students/${id}/samples`)
      .send({ test: 'foo' })
      .set({ Authorization })
      .expect(201);

    await delay(1000);

    await agent
      .patch(`/students/${id}/samples/${sampleId}`)
      .send({ test: 'Bar' })
      .set({ Authorization })
      .expect(200);

    // should ignore first post request
    const changes = await getChanges(id, 'samples.test');
    expect(changes).toHaveLength(2);
    expect(changes[0].updates[0]['samples.test']).toMatch(
      'Bar',
    );

    expect(changes[1].additions[0]['samples.test']).toMatch(
      'foo',
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

    await delay(1000);
    await agent
      .post(`/students/${id}/samples`)
      .send({ test: 'Foo' })
      .set({ Authorization })
      .expect(201);

    await delay(1000);
    const {
      body: {
        samples: [{ id: sampleId }, { id: sampleId2 }],
      },
    } = await agent
      .post(`/students/${id}/samples`)
      .send({ test: 'Bar' })
      .set({ Authorization })
      .expect(201);

    await delay(1000);
    await agent
      .patch(`/students/${id}/samples`)
      .query({
        ids: [sampleId, sampleId2],
      })
      .send({ test: 'Quuz' })
      .set({ Authorization })
      .expect(200);

    const changes = await getChanges(id, 'samples.test');
    expect(changes).toHaveLength(3);

    expect(changes).toEqual([
      {
        updates: [
          {
            'samples.test': 'Quuz',
          },
          {
            'samples.test': 'Quuz',
          },
        ],
        date: expect.any(String),
        user: 'Mike Ibberson',
      },
      {
        additions: [
          {
            'samples.test': 'Bar',
          },
        ],
        date: expect.any(String),
        user: 'Mike Ibberson',
      },
      {
        additions: [
          {
            'samples.test': 'Foo',
          },
        ],
        date: expect.any(String),
        user: 'Mike Ibberson',
      },
    ]);
  });

  it('should return users who have modified the document', async () => {
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
      body: { users },
    } = await agent
      .get(`/audit-users?collectionName=students&id=${id}`)
      .set({ Authorization })
      .expect(200);

    expect(users).toHaveLength(1);
    expect(users[0]).toHaveProperty(
      'name',
      'Mike Ibberson',
    );
  });

  it('should block access', async () =>
    agent
      .get(
        `/audit?collectionName=students&id=${mongoose.Types.ObjectId()}&targets=foo,bar`,
      )
      .expect(403));

  it('should fail validation', async () =>
    agent
      .get('/audit?collectionName=students')
      .expect(422));

  it('should fail validation', async () =>
    agent
      .get(
        `/audit?collectionName=students&id=${mongoose.Types.ObjectId()}`,
      )
      .expect(422));

  it('should fail validation', async () =>
    agent
      .get('/audit?collectionName=students&targets=foo,bar')
      .expect(422));
});
