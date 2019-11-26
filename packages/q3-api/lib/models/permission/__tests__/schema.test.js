require('../../../plugins');
const mongoose = require('../../../config/mongoose');
const Schema = require('..');

let Model;
const coll = 'test_access';

beforeAll(async () => {
  Model = mongoose.model(coll, Schema);
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
      fields: '*',
      coll,
    });
    const { errors } = doc.validateSync();
    expect(Object.keys(errors)).toEqual(
      expect.arrayContaining(['op']),
    );
  });

  it('should fail on unknown collection', () => {
    const doc = new Model({
      op: 'Create',
      fields: '*',
      coll: 'fooey',
    });
    return expect(doc.save()).rejects.toThrowError();
  });

  it('should fail on insufficient permissions', () => {
    const doc = new Model({
      op: 'Create',
      fields: 'op',
      coll,
    });
    return expect(doc.save()).rejects.toThrowError();
  });
});

describe('pre-save integration', () => {
  const details = {
    role: 'foo',
    op: 'Update',
    fields: '*',
    coll,
  };

  it('should return unique document', async () => {
    const { _id: id } = await Model.create(details);
    expect(id).toBeDefined();
    return expect(
      Model.create(details),
    ).rejects.toThrowError();
  });
});

describe('GetRequiredFields', () => {
  it('should get all required fields', () => {
    expect(Model.getRequiredFields()).toEqual([
      'op',
      'coll',
    ]);
  });
});
