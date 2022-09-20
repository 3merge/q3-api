jest.mock('q3-core-scheduler', () => ({
  queue: jest.fn(),
}));

const Q3 = require('q3-api');
const setup = require('../fixtures');
const { teardown } = require('../helpers');

let agent;

beforeAll(async () => {
  ({ agent } = await setup());

  await Q3.model('segments').create({
    collectionName: 'students',
    entries: [
      {
        label: 'Segment #1',
        value: '?purpose=string(test)',
      },
    ],
  });
});

afterAll(teardown);

describe('q3-api', () => {
  describe('/sys-segments', () => {
    it('should return all segments', async () => {
      const { body } = await agent
        .get('/system-segments')
        .expect(200);

      console.log(body);
    });
  });
});
