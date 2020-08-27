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
});
