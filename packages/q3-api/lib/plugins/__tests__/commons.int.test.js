const mongoose = require('../../config/mongoose');
const plugin = require('../commons');

let Model;

const pluginSchemaEnabled = new mongoose.Schema({
  friend: mongoose.Types.ObjectId,
  name: String,
});

beforeAll(async () => {
  mongoose.plugin(plugin);
  Model = mongoose.model('Demo', pluginSchemaEnabled);
  await mongoose.connect(process.env.CONNECTION);
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
