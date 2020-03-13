/* eslint-disable import/no-extraneous-dependencies */
jest.unmock('express-validator');

const Q3 = require('q3-api');
const supertest = require('supertest');
const { intercept } = require('q3-core-session');

let app;

beforeAll(async () => {
  app = supertest(Q3.$app);
});

describe('Q3 smoke testing', () => {
  it('should execute postAuthentication middleware', async (done) => {
    Q3.config({
      postAuthentication(req, session) {
        expect(session).toHaveProperty('TEST', 1);
        done();
      },
    });

    intercept('TEST', () => 1);

    Q3.routes();

    await Q3.connect();
    return app.get('/');
  });
});
