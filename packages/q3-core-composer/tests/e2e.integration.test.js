const express = require('express');
const supertest = require('supertest');
const { compose, check, redact } = require('..');

jest.unmock('express-validator');

let app;
let agent;

// eslint-disable-next-line
const listenForErrors = (err, req, res, next) => {
  res.status(err.errors ? 422 : 500).send();
};

beforeAll(() => {
  app = express();
  agent = supertest(app);
});

describe('compose', () => {
  it('should stack middleware', () => {
    const obj = () => null;
    expect(compose(obj).stack).toHaveLength(4);
  });

  it('should skip middleware without validation or authorizaion', async (done) => {
    app.get(
      '/',
      compose((req, res) => {
        res.send();
      }),
    );
    agent
      .get('/')
      .expect(200)
      .end(done);
  });

  it('should run validation', async (done) => {
    const route = (req, res) => {
      res.send();
    };

    route.validation = [check('foo').isString()];
    app.get('/validation', compose(route));
    app.use(listenForErrors);

    agent
      .get('/validation')
      .expect(422)
      .end(done);
  });

  it('should run authorization', async (done) => {
    const route = (req, res) => {
      res.json({
        mono: {
          foo: 1,
          bar: 1,
          quux: 1,
        },
      });
    };

    route.authorization = [
      redact('Foo').inResponse('mono'),
    ];

    app.use((req, res, next) => {
      req.grants = [
        {
          coll: 'Foo',
          fields: 'bar, quux',
        },
      ];

      next();
    });

    app.get('/authorization', compose(route));
    app.use(listenForErrors);

    agent
      .get('/authorization')
      .expect(({ body }) => {
        expect(body.mono).not.toHaveProperty('foo');
        expect(body.mono).toMatchObject({
          bar: 1,
          quux: 1,
        });
      })
      .end(done);
  });

  it('should call effect', async () => {
    const first = jest.fn();
    const second = jest.fn();
    const data = { foo: 'bar' };

    const route = (req, res) => {
      req.evoke(data);
      res.json({});
    };

    route.effect = [first, second];

    app.get('/effect', compose(route));
    app.use(listenForErrors);
    await agent.get('/effect').expect(200);

    expect(first).toHaveBeenCalledWith(
      data,
      expect.any(Object),
    );
    expect(second).not.toHaveBeenCalled();
  });
});
