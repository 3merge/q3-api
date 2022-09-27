jest.mock('q3-core-scheduler', () => ({
  queue: jest.fn(),
}));

const Q3 = require('q3-api');
const setup = require('../fixtures');
const { teardown } = require('../helpers');

let Authorization;
let agent;

beforeAll(async () => {
  ({ Authorization, agent } = await setup());
});

beforeEach(async () => {
  await Q3.model('segments').findOneAndUpdate(
    {
      collectionName: 'students',
    },
    {
      entries: [
        {
          label: 'Segment #1',
          value: '?purpose=string(test)',
        },
      ],
    },
    {
      upsert: true,
    },
  );
});

afterAll(teardown);

describe('q3-api', () => {
  describe('/sys-segments', () => {
    describe('get', () => {
      it('should return all segments', async () => {
        const { body } = await agent
          .get('/system-segments')
          .set({ Authorization })
          .expect(200);

        expect(body.segments).toHaveLength(1);
      });

      it('should return 401', async () => {
        await agent.get('/system-segments').expect(401);
      });
    });

    describe('put', () => {
      it('should fail validation', async () => {
        await agent.put('/system-segments').expect(422);
      });

      it('should add to segments', async () => {
        const { body } = await agent
          .put('/system-segments')
          .set({ Authorization })
          .send({
            action: 'create',
            collectionName: 'students',
            payload: {
              label: 'Segment #2',
              value: '?purpose=string(test)',
            },
          })
          .expect(200);

        expect(body.segments).toHaveLength(2);
      });
    });
  });
});
