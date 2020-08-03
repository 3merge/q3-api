const setup = require('../fixtures');
const { teardown } = require('../helpers');

let Authorization;
let agent;

jest.unmock('express-validator');

beforeAll(async () => {
  ({ Authorization, agent } = await setup());
});

afterAll(teardown);

describe('Workers', () => {
  it('should run import module', async (done) => {
    await agent
      .post('/imports?template=students')
      .set({ Authorization })
      .expect(204);

    setTimeout(async () => {
      const {
        body: { logs },
      } = await agent
        .get('/system-logs')
        .set({ Authorization })
        .expect(200);

      expect(logs[0]).toHaveProperty(
        'event',
        'students-importer',
      );

      done();
      // let the process finish
    }, 4000);
  });
});
