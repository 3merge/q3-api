jest.unmock('express-validator');

const setup = require('../fixtures');
const { teardown } = require('../helpers');

let Authorization;
let agent;

beforeAll(async () => {
  ({ Authorization, agent } = await setup());
});

afterAll(teardown);

describe('Template-based routes', () => {
  describe('io', () => {
    it('should return 422', () =>
      agent
        .post('/io?template=unknown')
        .set({ Authorization })
        .expect(422));

    it('should return 204', () =>
      agent
        .post('/io?template=students')
        .set({ Authorization })
        .expect(204));
  });

  describe('reports', () => {
    it('should return 422', () =>
      agent
        .get('/reports?template=unknown')
        .set({ Authorization })
        .expect(422));

    it('should return 200', () =>
      agent
        .get('/reports?template=classSchedule')
        .set({ Authorization })
        .expect(200));
  });
});
