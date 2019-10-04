const Q3 = require('q3-api');
const supertest = require('supertest');
const { check } = require('express-validator');
const { Schema } = require('mongoose');
const Q3Roles = require('../..');
const { MODEL_NAME } = require('../constants');

jest.unmock('request-context');

let agent;

const { redact, permit } = Q3Roles;
const coll = 'Foo';

const rule = {
  role: 'Developer',
  op: 'Create',
  fields: 'preserve, !bar, !quux.*, foo.grault*',
  coll,
};

const processReq = jest.fn();

const Foo = async (req, res) => {
  processReq(req.body);
  res.ok({
    data: {
      preserve: 1,
      bar: 1,
      foo: {
        garply: 1,
        grault: 1,
      },
      quux: {
        garply: 1,
      },
    },
  });
};

Foo.validation = [
  check('bar')
    .isInt()
    .optional(),
  check('preserve')
    .isInt()
    .optional(),
];

Foo.authorization = [
  permit(rule.coll),
  redact('request').in('body'),
  redact('response').in('data'),
];

describe('Q3 integration', () => {
  beforeAll(async () => {
    agent = supertest(Q3.$app);
    Q3.register(Q3Roles);

    Q3.register((app, db) => {
      db.model(
        coll,
        new Schema({
          bar: String,
          baz: String,
        }),
      );

      app.use((req, res, next) => {
        req.user = {};
        req.user.role = rule.role;
        next();
      });

      app.get('/foo', Q3.define(Foo));
      app.post('/foo', Q3.define(Foo));
    });

    await Q3.connect();
    await Q3.model(MODEL_NAME).create(rule);
  });

  beforeEach(() => {
    processReq.mockReset();
  });

  afterAll(() => {
    Q3.$app.close();
  });

  it('should return 403', async () =>
    agent.get('/foo').expect(403));

  it('should return 200', async () =>
    agent.post('/foo').expect(200));

  it('should redact request', async () =>
    agent
      .post('/foo')
      .send({
        preserve: 1,
        bar: 1,
      })
      .expect(() => {
        expect(processReq).toHaveBeenCalledWith({
          preserve: 1,
        });
      }));

  it('should return redacted', async () =>
    agent
      .post('/foo')
      .send({
        preserve: 1,
        bar: 1,
      })
      .expect(({ body }) => {
        expect(body.data).not.toHaveProperty('bar');
        expect(body.data).toEqual({
          preserve: 1,
          foo: {
            grault: 1,
          },
        });
      }));
});
