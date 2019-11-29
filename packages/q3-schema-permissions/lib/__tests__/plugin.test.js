const globalizedPlugin = require('q3-schema-utils/plugins/common');
const mongoose = require('mongoose');
const plugin = require('../plugin');

const id = mongoose.Types.ObjectId();
const company = mongoose.Types.ObjectId();
const getGrant = jest.fn();
const getUser = jest.fn();

const Schema = new mongoose.Schema({
  belongs: mongoose.Types.ObjectId,
  specialCondition: Number,
  name: String,
});

mongoose.plugin(globalizedPlugin);

Schema.plugin(plugin, {
  getGrant,
  getUser,
});

const Model = mongoose.model('AccessControlPlugin', Schema);

let comparativeIds = [];
const numNotCreatedBy = 3;
const numNotCreatedByOrBelongingTo = 2;
const numNotSpecial = 4;

const countResults = async (num) => {
  const total = await Model.countDocuments({
    _id: comparativeIds,
  })
    .setOptions({ bypassAuthorization: true })
    .exec();

  const redacted = await Model.countDocuments({
    _id: comparativeIds,
  }).exec();

  expect(redacted).toBe(total - num);
};

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);

  const original = await Model.create([
    { name: 'Bar', belongs: id }, // won't match
    { name: 'Outlier' }, // won't match
    { name: 'Foo', belongs: company }, // sometimes matches
    { name: 'Quux', createdBy: id },
    {
      name: 'Graply',
      specialCondition: 2,
      createdBy: id,
    },
  ]);

  comparativeIds = original.map(({ _id }) => _id);
});

afterAll(async () => {
  await Model.deleteMany({});
});

describe('Middleware', () => {
  beforeAll(() => {
    getUser.mockReturnValue({
      _id: id,
      company,
    });
  });

  describe('Pre-save', () => {
    it('should append createdBy meta', async () => {
      const doc = await Model.create({ name: 'Jon' });
      expect(doc).toHaveProperty('createdBy', id);
    });

    it('preserve createdBy meta', async () => {
      const doc = await Model.create({ name: 'Jon' });
      doc.createdBy = company;
      expect(await doc.save()).toHaveProperty(
        'createdBy',
        company,
      );
    });
  });

  describe('Pre-find', () => {
    it('should append createdBy meta', async () => {
      const query = Model.findOne();
      const spy = jest.fn().mockReturnValue(query);
      query.where = spy;
      await query.exec();

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          createdBy: id,
        }),
      );
    });

    it('should append alias meta', async () => {
      getGrant.mockReturnValue({
        ownership: 'Own',
        ownershipAliases: [
          {
            local: 'belongs',
            foreign: 'company',
          },
        ],
      });

      const query = Model.findOne();
      const spy = jest.fn().mockReturnValue(query);
      query.or = spy;
      await query.exec();

      expect(spy).toHaveBeenCalledWith([
        { createdBy: id },
        { belongs: company },
      ]);
    });

    it('should skip all authorization', async () => {
      getGrant.mockReturnValue({
        ownership: 'Any',
      });

      const query = Model.findOne();
      query.where = jest.fn();
      query.or = jest.fn();
      await query.exec();

      expect(query.where).not.toHaveBeenCalled();
      expect(query.or).not.toHaveBeenCalled();
    });

    it('should bypass authorization', async () => {
      getGrant.mockReturnValue();
      const query = Model.findOne().setOptions({
        bypassAuthorization: true,
      });

      query.where = jest.fn();
      query.or = jest.fn();
      await query.exec();

      expect(query.where).not.toHaveBeenCalled();
      expect(query.or).not.toHaveBeenCalled();
    });

    it('should filter by creator', async () => {
      await countResults(numNotCreatedBy);
    });

    it('should filter by belongs property', async () => {
      getGrant.mockReturnValue({
        ownership: 'Own',
        ownershipAliases: [
          {
            local: 'belongs',
            foreign: 'company',
          },
        ],
      });

      await countResults(numNotCreatedByOrBelongingTo);
    });

    it('should filter by special condition', async () => {
      getGrant.mockReturnValue({
        documentConditions: ['specialCondition=2'],
        ownership: 'Own',
        ownershipConditions: [],
        ownershipAliases: [
          {
            local: 'belongs',
            foreign: 'company',
          },
        ],
      });

      await countResults(numNotSpecial);
    });
  });
});
