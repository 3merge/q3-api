const jwt = require('jsonwebtoken');
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
  describe('/documentation', () => {
    it('should return token', async () => {
      process.env.FRESHBOOKS_SECRET = 123;
      process.env.FRESHBOOKS_ACCOUNT_NAME = 'Foo';
      process.env.FRESHBOOKS_ACCOUNT_EMAIL = 'Bar';

      const {
        body: { token },
      } = await agent
        .get('/documentation')
        .set({ Authorization });

      expect(token).toBeDefined();
      expect(
        jwt.verify(token, process.env.FRESHBOOKS_SECRET),
      ).toMatchObject({
        name: process.env.FRESHBOOKS_ACCOUNT_NAME,
        email: process.env.FRESHBOOKS_ACCOUNT_EMAIL,
      });
    });
  });

  describe('/profile', () => {
    it('should return redacted profile information', async () => {
      const {
        body: { profile },
      } = await agent
        .get('/profile')
        .set({ Authorization });

      expect(profile).toHaveProperty('email');
      expect(profile).not.toHaveProperty('lastName');
    });

    it.only('should prevent profile from updating', async () => {
      const email = 'no@change.com';
      const firstName = 'Mike';

      const {
        body: { profile },
      } = await agent
        .post('/profile')
        .field('firstName', firstName)
        .field('email', email)
        .set({
          Authorization,
        })
        .expect(200);

      expect(profile.email).not.toMatch(email);
      expect(profile.firstName).toMatch(firstName);
    });
  });

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

  describe('emails-preview', () => {
    it('should return return 401', async () => {
      await agent
        .post('/emails-preview?mjml=<mjml>')
        .expect(401);
    });

    it('should return return 403', async () => {
      await user.update({
        role: 'Unknown',
      });

      await agent
        .post('/emails-preview?mjml=<mjml>')
        .set({ Authorization })
        .expect(403);
    });

    it('should return return 422', async () => {
      await agent.post('/emails-preview').expect(422);
    });

    it('should return preview', async () => {
      await user.update({
        role: 'Developer',
      });

      const { body } = await agent
        .post('/emails-preview')
        .send({
          mjml: 'mjml=<mjml><mj-body><mj-text>Sample {{name}}</mj-text></mj-body></mjml>',
          variables: {
            name: 'Document',
          },
        })
        .set({ Authorization })
        .expect(200);

      expect(body.html).toMatch('Sample Document');
    });
  });
});
