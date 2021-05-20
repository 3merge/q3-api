const {
  setup,
  start,
  stop,
  teardown,
} = require('../fixtures');

beforeAll(setup);
beforeEach(start);
afterEach(stop);
afterAll(teardown);
