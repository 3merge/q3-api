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

  it('should ignore on create payloads', async () => {
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
    ).resolves.toHaveLength(0);
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
    ).resolves.toHaveLength(1);
  });

  it('should ignore automated data changes', async () => {
    await addFriend(id, 'Barrie');
    await addFriend(id, 'Christine');
    const {
      body: { friends },
    } = await addFriend(id, 'Angus');

    const v = await getStudentVersion();
    expect(v).toHaveLength(4);

    await agent
      .patch(`/students/${id}/friends/${friends[1].id}`)
      .send({ name: 'Allan' })
      .set({ Authorization })
      .expect(200);

    const v2 = await getStudentVersion();

    expect(v2).toHaveLength(5);
    expect(
      v2[0].modified['friends%2E1%2Ename'],
    ).toHaveProperty('prev', 'Christine');
  });
});
