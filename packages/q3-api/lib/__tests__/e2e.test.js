// eslint-disable-next-line
const request = require('supertest');
const i18 = require('i18next');
const mongoose = require('mongoose');
const dot = require('dotenv');
const deco = require('../helpers/middleware');
const { compose } = require('../helpers/utils');
const parser = require('../helpers/parser');
const val = require('../config/validator');
const Exp = require('..');

jest.mock('dotenv');
jest.mock('i18next');
jest.mock('../config/validator');
jest.mock('../helpers/middleware');
jest.mock('../helpers/parser');
jest.mock('../helpers/utils');

test('init should configure environment', async () => {
  await request(Exp.init()).get('/');
  expect(dot.config).toHaveBeenCalled();
  expect(deco).toHaveBeenCalled();
});

test('define should run composer', () => {
  const mockController = jest.fn();
  Exp.define(mockController);
  expect(val).toHaveBeenCalled();
  expect(compose).toHaveBeenCalled();
});

test('register should pass instance arguments into a callback fn', (done) => {
  const options = { foo: 'bar' };
  Exp.register((app, db, opts) => {
    expect(app).toBeDefined();
    expect(db.connection.readyState).toBe(0);
    expect(opts).toMatchObject(options);
    done();
  }, options);
});

test('translate should execute i18::t method', () => {
  Exp.translate('foo');
  expect(i18.t).toHaveBeenCalledWith('foo', null);
});

test('translate should execute i18::t method with sprintf', () => {
  Exp.translate('foo', [1]);
  expect(i18.t).toHaveBeenCalledWith('foo', {
    postProcess: expect.any(String),
    sprintf: expect.any(Array),
  });
});

describe('model', () => {
  beforeAll(() => {
    Exp.register((_, db) => {
      db.model(
        'Bar',
        new mongoose.Schema({
          firstName: String,
        }),
      );
    });
  });

  it('should parse mongoose models list', () => {
    expect(() => Exp.model('Foo')).toThrowError();
    expect(Exp.model('Bar')).toEqual(expect.any(Function));
  });
});

test('walk should call parser with dirname', () => {
  Exp.walk('/foo');
  expect(parser).toHaveBeenCalledWith(expect.any(String));
});

describe('start', () => {
  it('should listen to port on success', async (done) => {
    Exp.connect().then((err) => {
      expect(err).toBeNull();
      done();
    });
  });
});
