import i18 from 'i18next';
import request from 'supertest';
import mongoose from 'mongoose';
import dot from 'dotenv';
import deco from '../helpers/middleware';
import events from '../helpers/events';
import { compose } from '../helpers/utils';
import parser from '../helpers/parser';
import val from '../lib/validator';
import Exp from '..';

jest.mock('dotenv');
jest.mock('i18next');
jest.mock('../lib/validator');
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

test('notify should dispatch event', (done) => {
  Exp.subscribe().on('foo', done);
  Exp.notify('foo');
});

test('subscribe should return event emitter', () => {
  expect(Exp.subscribe()).toMatchObject(events);
});

test('translate should execture i18::t method', () => {
  Exp.translate('foo');
  expect(i18.t).toHaveBeenCalledWith('foo');
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
  /*  it('should exit on failed connection', (done) => {
    process.env.CONNECTION = 'uri';
    process.env.PORT = '800';
    Exp.connect().then((err) => {
      expect(err).toBeDefined();
      done();
    });
  });
*/
  it('should listen to port on success', async (done) => {
    Exp.connect().then((err) => {
      expect(err).toBeNull();
      done();
    });
  });
});
