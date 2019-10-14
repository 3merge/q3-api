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
    expect(compose(obj).stack).toHaveLength(5);
    expect(compose(obj).root).toEqual(expect.any(Function));
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

  it('should run validation', async () => {
    const route = (req, res) => {
      res.send();
    };

    route.validation = [check('foo').isString()];
    app.get('/validation', compose(route));
    app.use(listenForErrors);

    return agent.get('/validation').expect(422);
  });

  it('should run authorization', async () => {
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
      req.user = {
        _id: 1,
        role: 'Developer',
      };

      req.authorization = async () =>
        Promise.resolve({
          coll: 'Foo',
          fields: 'bar, quux',
          role: 'Developer',
        });

      next();
    });

    app.get('/authorization', compose(route));
    app.use(listenForErrors);

    return agent
      .get('/authorization')
      .expect(({ body }) => {
        expect(body.mono).not.toHaveProperty('foo');
        expect(body.mono).toMatchObject({
          bar: 1,
          quux: 1,
        });
      });
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

describe('Lib', () => {
  it('should append new method to express-validator', () => {
    expect(check('hello').respondsWith).toBeDefined();
  });
});
