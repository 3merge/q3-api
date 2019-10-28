const mongoose = require('mongoose');
const {
  getSchemaParts,
  readSchemaPaths,
  setDynamicErrorMsg,
} = require('../utils');

let Model;

beforeAll(() => {
  mongoose.pluralize(null);
  const Schema = new mongoose.Schema({
    firstName: String,
    lastName: { type: String, private: true },
  });

  Model = mongoose.model('mocker', Schema);
});

describe('getSchemaParts', () => {
  it('should throw an error', () => {
    expect(() =>
      getSchemaParts({
        collection: { collectionName: 'unknown' },
      }),
    ).toThrowError();
  });

  it('should return paths and discriminators', () => {
    expect(getSchemaParts(Model)).toMatchObject({
      schema: expect.any(Object),
      discriminators: {},
      paths: {
        firstName: expect.any(Object),
        lastName: expect.any(Object),
      },
    });
  });
});

describe('readSchemaPaths', () => {
  it('should convert types', () => {
    const o = readSchemaPaths(getSchemaParts(Model).paths);
    expect(o.lastName).not.toBeDefined();
    expect(o.firstName).toMatchObject({
      validator: 'isString',
    });
  });
});

test('setDynamicErrorMsg should call translator middleware', () => {
  const t = jest.fn();
  setDynamicErrorMsg()(null, { req: { t } });
  expect(t).toHaveBeenCalled();
});
