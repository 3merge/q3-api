const supertest = require('supertest');
const { Users } = require('q3-api');
const app = require('..');

let agent;

beforeAll(async () => {
  agent = supertest(await app);
});

describe('Q3 smoke testing', () => {
  describe('authentication', () => {
    it('should require login', async () =>
      agent.get('/profile').expect(401));

    it('should create a session', async () => {
      const email = 'mary.anne@gmail.com';
      const password = 'LogMeIn!2019';
      const host = 'localhost';
      const user = await Users.create({
        firstName: 'Mary',
        lastName: 'Anne',
        role: 'Secretary',
        active: true,
        verified: true,
        secret: 'Shh!',
        email,
      });

      await user.setPassword(password);
      await user.save();

      await agent
        .get(`/authenticate?email=${email}`)
        .expect(204);

      const {
        body: { token, nonce },
      } = await agent
        .post('/authenticate')
        .send({ email, password })
        .set({ host })
        .expect(201);

      const { body } = await agent
        .post('/apikey')
        .set({
          Authorization: `Bearer ${token}`,
          'token-nonce': nonce,
          host,
        })
        .expect(201);
        console.log(body)
    });
  });
});
