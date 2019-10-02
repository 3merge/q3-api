const Q3 = require('q3-api').default;
const Schema = require('../schema');

let Model;

beforeAll(async () => {
  Model = Q3.setModel('test_access', Schema);
  await Q3.connect();
});

afterAll(async () => {
  await Model.deleteMany({});
});

describe('model validation', () => {
  it('should fail without required properties', () => {
    const doc = new Model();
    const { errors } = doc.validateSync();
    expect(Object.keys(errors)).toEqual(
      expect.arrayContaining(['op', 'coll']),
    );
  });

  it('should fail without ENUM values', () => {
    const doc = new Model({
      op: 'Insert',
      coll: 'access',
    });
    const { errors } = doc.validateSync();
    expect(Object.keys(errors)).toEqual(
      expect.arrayContaining(['op']),
    );
  });
});

describe('pre-save integration', () => {
  const details = {
    coll: 'permissions',
    role: 'foo',
    op: 'Update',
  };

  it('should return document', () => {
    expect(Model.create(details)).resolves.toHaveProperty(
      '_id',
    );
  });

  it('should fail on duplicate', () => {
    expect(Model.create(details)).rejects.toThrowError();
  });
});
