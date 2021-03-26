const setup = require('../fixtures');
const { teardown } = require('../helpers');

let Authorization;
let agent;

const addFriend = async (id, name) =>
  agent
    .post(`/students/${id}/friends`)
    .send({ name })
    .set({ Authorization });

beforeAll(async () => {
  ({ Authorization, agent } = await setup());
  // eslint-disable-next-line
  require('q3-plugin-changelog/lib/changestream')();
});

afterAll(teardown);

describe('Version control plugin', () => {
  let id;

  const getStudentVersion = async () => {
    const {
      body: { versions },
    } = await agent
      .get(
        `/history?collectionName=students&documentId=${id}`,
      )
      .set({ Authorization })
      .expect(200);

    return versions;
  };

  it('should capture on create payloads', async () => {
    ({
      body: {
        student: { id },
      },
    } = await agent
      .post('/students')
      .send({
        '__t': 'teach-assistant',
        name: 'George',
        class: 'Science',
      })
      .set({ Authorization })
      .expect(201));

    return expect(
      getStudentVersion(),
    ).resolves.toHaveLength(1);
  });

  it('should capture patch payloads', async () => {
    await agent
      .patch(`/students/${id}`)
      .send({
        '__t': 'teach-assistant',
        name: 'Bobby',
        age: 21,
        class: 'Math',
      })
      .set({ Authorization })
      .expect(200);

    return expect(
      getStudentVersion(),
    ).resolves.toHaveLength(2);
  });
});
