const setup = require('../fixtures');
const { teardown } = require('../helpers');

let Authorization;
let agent;
let user;

beforeAll(async () => {
  ({ Authorization, agent, user } = await setup());

  await agent
    .post('/students')
    .set({ Authorization })
    .send({ name: 'Jon' })
    .expect(201);
});

afterAll(teardown);

describe('q3-api', () => {
  describe('/distinct', () => {
    it('should return return 403', async () => {
      await agent
        .get('/distinct?collectionName=students&field=name')
        .expect(401);
    });

    it('should return return 403', async () => {
      await user.update({
        role: 'Unknown',
      });

      await agent
        .get('/distinct?collectionName=students&field=name')
        .set({ Authorization })
        .expect(403);
    });

    it('should return distinct values', async () => {
      await user.update({
        role: 'Developer',
      });

      const {
        body: { values },
      } = await agent
        .get('/distinct?collectionName=students&field=name')
        .set({ Authorization })
        .expect(200);

      expect(values).toContain('Jon');
    });
  });
});
