const mongoose = require('mongoose');
const plugin = require('../common');

let Model;

const childSchema = new mongoose.Schema({
  breed: String,
});

const pluginSchemaEnabled = new mongoose.Schema(
  {
    age: { type: Number, default: 10, required: true },
    friend: mongoose.Types.ObjectId,
    dogs: [childSchema],
    name: String,
  },
  {
    featured: true,
    enableArchive: true,
  },
);

const stub = {
  active: true,
  name: 'Foo',
  dogs: [
    { breed: 'Retriever' },
    { breed: 'Pitbull' },
    { breed: 'Poodle' },
  ],
};

const getIds = (a = []) => a.map(({ _id }) => _id);

const expectInactive = async (id) =>
  expect(await Model.findById(id).exec()).toMatchObject({
    active: false,
  });

beforeAll(async () => {
  mongoose.plugin(plugin);
  Model = mongoose.model(
    `CommonsModel=${new Date().toISOString()}`,
    pluginSchemaEnabled,
  );

  await mongoose.connect(process.env.CONNECTION);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Commons plugin', () => {
  describe('Configuration', () => {
    it('schema configure options and paths', () => {
      expect(Model.schema.path('active')).toBeDefined();
      expect(Model.schema.path('featured')).toBeDefined();
      expect(Model.schema.get('toJSON')).toBeDefined();
      expect(Model.schema.get('toObject')).toBeDefined();
    });
  });

  describe('archive', () => {
    it('should set document active property to false', async () => {
      const { _id: id } = await Model.create(stub);
      await Model.archive(id);
      return expectInactive(id);
    });

    it('should set multiple documents to inactive', async () => {
      const resp = await Model.create([stub, stub, stub]);
      const ids = getIds(resp);
      await Model.archiveMany(ids);
      return expectInactive(ids[0]);
    });
  });

  describe('findOrCreate', () => {
    it('should create then return duplicate document', async () => {
      const args = { name: 'John', age: 26 };
      const doc = await Model.findOneOrCreate(args);
      const doc2 = await Model.findOneOrCreate(args);
      return expect(doc._id.equals(doc2._id)).toBeTruthy();
    });
  });

  describe('schema helpers', () => {
    it('should return all ObjectIds', () =>
      expect(Model.getReferentialPaths()).toEqual([
        'friend',
      ]));

    it('should return all required fields', () =>
      expect(Model.getRequiredFields()).toEqual(['age']));

    it('should return all fields', () => {
      expect(Model.getAllFields()).toEqual(
        expect.arrayContaining([
          'name',
          'friend',
          'age',
          'dogs.breed',
        ]),
      );
    });
  });
});
