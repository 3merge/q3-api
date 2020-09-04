const setup = require('../fixtures');
const { teardown } = require('../helpers');

let Authorization;
let agent;

beforeAll(async () => {
  ({ Authorization, agent } = await setup());
});

afterAll(teardown);

describe('q3-core-rest', () => {
  it('should stress-test monkey-patched GET endpoint', async () => {
    await Promise.all(
      new Array(10).map(() =>
        agent
          .get('/students')
          .set({ Authorization })
          .expect(200),
      ),
    );
  });

  it('should redact sub-document', async () => {
    const {
      body: {
        student: { id },
      },
    } = await agent
      .post('/students')
      .set({ Authorization })
      .send({})
      .expect(201);

    await agent
      .post(`/students/${id}/samples`)
      .set({ Authorization })
      .send({ test: 'Foo' })
      .expect(201);

    const {
      body: {
        samples: [sample],
      },
    } = await agent
      .get(`/students/${id}/samples`)
      .set({ Authorization })
      .expect(200);

    expect(sample).toHaveProperty('test');
    expect(sample).not.toHaveProperty('createdAt');
    expect(sample).not.toHaveProperty('updatedAt');
  });
});
