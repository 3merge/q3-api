const Q3 = require('q3-api');
const setup = require('../fixtures');
const { access, teardown } = require('../helpers');

let Authorization;
let agent;

beforeAll(async () => {
  ({ Authorization, agent } = await setup());
});

beforeEach(() => {
  access.refresh();
});

afterEach(async () => {
  await Q3.model('students').deleteMany({});
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

  it('should return full document', async () => {
    const {
      body: {
        student: { id },
      },
    } = await agent
      .post('/students')
      .set({ Authorization })
      .send({})
      .expect(201);

    const {
      body: {
        samples: [{ id: sampleId }],
      },
    } = await agent
      .post(`/students/${id}/samples`)
      .set({ Authorization })
      .send({ test: 'Foo' })
      .expect(201);

    const {
      body: { full },
    } = await agent
      .patch(
        `/students/${id}/samples/${sampleId}?fullReceipt=true`,
      )
      .set({ Authorization })
      .expect(200);

    expect(full).toHaveProperty('id');
    expect(full).not.toHaveProperty('socialStatus');
  });

  it('should find nullish properties', async () => {
    await Promise.all(
      [{}, { date: null }, { date: new Date() }].map(
        (item) =>
          agent
            .post('/students')
            .set({ Authorization })
            .send(item)
            .expect(201),
      ),
    );

    const {
      body: { students },
    } = await agent
      .get('/students?date=has(false)&fields=date')
      .set({ Authorization })
      .expect(200);

    expect(students).toHaveLength(2);
  });
});
