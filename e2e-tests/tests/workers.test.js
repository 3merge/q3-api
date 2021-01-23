const path = require('path');
const queue = require('q3-api/lib/startQueue');
const setup = require('../fixtures');
const { teardown } = require('../helpers');

let Authorization;
let agent;
let __$db;

jest.unmock('express-validator');

beforeAll(async () => {
  ({ Authorization, agent } = await setup());
  ({ __$db } = await queue(
    path.resolve(__dirname, '../fixtures'),
  ));
});

afterAll(teardown);

describe('Workers', () => {
  it('should run import module', async (done) => {
    await agent
      .post('/imports?template=students')
      .set({ Authorization })
      .expect(204);

    setTimeout(async () => {
      const doc = await __$db.findOne({
        status: 'Done',
        name: 'students',
      });

      expect(doc).not.toBeNull();
      done();
    }, 4000);
  });
});
