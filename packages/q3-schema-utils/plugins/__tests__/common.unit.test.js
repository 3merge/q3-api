const mongoose = require('mongoose');
const plugin = require('../common');

let Model;

const pluginSchemaEnabled = new mongoose.Schema({
  friend: mongoose.Types.ObjectId,
  name: String,
});

beforeAll(async () => {
  mongoose.plugin(plugin);
  Model = mongoose.model(
    'CommonsModel',
    pluginSchemaEnabled,
  );

  await mongoose.connect(process.env.CONNECTION);
});

test('schema should have new properties', () => {
  expect(Model.schema.path('active')).toBeDefined();
  expect(Model.schema.path('featured')).toBeDefined();
  expect(Model.schema.path('unknown')).toBeDefined();
});

describe('findStrictly', () => {
  it('should throw', async () => {
    expect(
      Model.findStrictly(mongoose.Types.ObjectId()),
    ).rejects.toThrowError();
  });

  it('should return single result with virtuals', async () => {
    const { _id: id } = await Model.create({
      name: 'Foo',
    });
    expect(Model.findStrictly(id)).resolves.toHaveProperty(
      'id',
    );
  });
});

describe('getObjectIds', () => {
  it('should return array', async () => {
    expect(Model.getReferentialPaths()).toEqual(['friend']);
  });
});
