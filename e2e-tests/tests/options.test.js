const setup = require('../fixtures');
const { teardown } = require('../helpers');

let Authorization;
let agent;

jest.unmock('express-validator');

afterAll(teardown);

beforeAll(async () => {
  ({ Authorization, agent } = await setup());
});

describe('Mongoose/Express Q3 config options', () => {
  it('should post a note', async () => {
    const {
      body: {
        student: { id },
      },
    } = await agent
      .post('/students')
      .send({ name: 'Paula' })
      .set({ Authorization })
      .expect(201);

    const {
      body: { thread },
    } = await agent
      .post(`/students/${id}/thread`)
      .send({
        message: 'Test',
      })
      .set({ Authorization })
      .expect(201);

    expect(thread).toHaveLength(1);
    expect(thread[0]).toHaveProperty('author');
    expect(thread[0]).toHaveProperty('message');
  });
});
