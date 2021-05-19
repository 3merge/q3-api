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

const countDogsAfterPush = async (doc, expected) => {
  const { dogs } = await doc.pushSubDocument('dogs', {
    breed: 'Terrier',
  });

  return expect(dogs).toHaveLength(expected);
};

const countDogsAfterDeletion = async (
  doc,
  id,
  expected,
) => {
  const { dogs } = await doc.removeSubDocument('dogs', id);
  return expect(dogs).toHaveLength(expected);
};

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

  describe('findStrictly', () => {
    it('should throw', () =>
      expect(
        Model.findStrictly(mongoose.Types.ObjectId()),
      ).rejects.toThrowError());

    it('should return single result with virtuals', async () => {
      const { _id: id } = await Model.create(stub);
      return expect(
        Model.findStrictly(id),
      ).resolves.toHaveProperty('id');
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

  describe('getSubDocument', () => {
    it('should throw an error', async () => {
      const resp = await Model.create(stub);
      return expect(() =>
        resp.getSubDocument(
          'dogs',
          mongoose.Types.ObjectId(),
        ),
      ).toThrowError();
    });

    it('should return the sub document', async () => {
      const resp = await Model.create(stub);
      const {
        dogs: [{ _id: id }],
      } = resp;
      return expect(
        resp.getSubDocument('dogs', id),
      ).toHaveProperty('breed', stub.dogs[0].breed);
    });
  });

  describe('pushSubDocument', () => {
    it('should add a new sub document', async () => {
      const resp = await Model.create(stub);
      return countDogsAfterPush(resp, 4);
    });

    it('should insert first sub document', async () => {
      const resp = await Model.create({ name: 'Test' });
      return countDogsAfterPush(resp, 1);
    });

    it('should catch error before validating the parent', async () => {
      const resp = await Model.create({ name: 'Test' });
      return expect(
        resp.pushSubDocument('dogs', {
          breed: {
            type: 'Corgi',
          },
        }),
      ).rejects.toMatchObject({
        errors: expect.objectContaining({
          breed: expect.any(Object),
        }),
      });
    });
  });

  describe('removeSubDocument', () => {
    it('should remove single subdocument', async () => {
      const resp = await Model.create(stub);
      const {
        dogs: [{ _id: id }],
      } = resp;
      return countDogsAfterDeletion(resp, id, 2);
    });

    it('should remove all subdocument', async () => {
      const resp = await Model.create(stub);
      return countDogsAfterDeletion(
        resp,
        getIds(resp.dogs),
        0,
      );
    });
  });

  describe('updateSubDocument', () => {
    it('should update a single document', async () => {
      const resp = await Model.create(stub);
      const {
        dogs: [{ _id: id }],
      } = resp;
      const breed = 'Boston';
      const { dogs } = await resp.updateSubDocument(
        'dogs',
        id,
        { breed },
      );
      return expect(dogs[0].breed).toBe(breed);
    });

    it('should catch validation errors early', async () => {
      const resp = await Model.create(stub);
      const {
        dogs: [{ _id: id }],
      } = resp;
      const breed = { type: 'Boston' };
      return expect(
        resp.updateSubDocument('dogs', id, { breed }),
      ).rejects.toMatchObject({
        errors: expect.objectContaining({
          breed: expect.any(Object),
        }),
      });
    });
  });

  describe('updateSubDocuments', () => {
    it('should update a single document', async () => {
      const resp = await Model.create(stub);
      const {
        dogs: [{ _id: id1 }, { _id: id2 }],
      } = resp;
      const breed = 'Boston';
      const { dogs } = await resp.updateSubDocuments(
        'dogs',
        [id1, id2],
        { breed },
      );

      expect(dogs[0].breed).toBe(breed);
      expect(dogs[1].breed).toBe(breed);
      expect(dogs[2].breed).not.toBe(breed);
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
