const mongoose = require('mongoose');
const Schema = require('..');

let Model;

beforeAll(async () => {
  Model = mongoose.model('test_access', Schema);
  await mongoose.connect(process.env.CONNECTION);
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
