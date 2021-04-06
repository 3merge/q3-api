const setup = require('../fixtures');
const { teardown } = require('../helpers');

let Authorization;
let agent;

beforeAll(async () => {
  ({ Authorization, agent } = await setup());
  // eslint-disable-next-line
  require('q3-plugin-changelog/lib/changestream')();
});

afterAll(teardown);

test('Version control', async () => {
  const {
    body: {
      student: { id },
    },
  } = await agent
    .post('/students')
    .send({ name: 'George' })
    .set({ Authorization })
    .expect(201);

  await agent
    .patch(`/students/${id}`)
    .send({ name: 'Greg' })
    .set({ Authorization })
    .expect(200);

  await agent
    .post(`/students/${id}/friends`)
    .send({ name: 'Jen', age: 21 })
    .set({ Authorization })
    .expect(201);

  // age is not tracked
  await agent
    .patch(`/students/${id}`)
    .send({ age: 22 })
    .set({ Authorization })
    .expect(200);

  const {
    body: { versions },
  } = await agent
    .get(
      `/history?collectionName=students&documentId=${id}`,
    )
    .set({ Authorization })
    .expect(200);

  expect(versions).toHaveLength(3);
});
