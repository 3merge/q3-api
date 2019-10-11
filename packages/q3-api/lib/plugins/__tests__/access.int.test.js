const ctx = require('request-context');
const mongoose = require('mongoose');
const plugin = require('../access');

let Model;
let get;
const id = mongoose.Types.ObjectId();
const company = mongoose.Types.ObjectId();

const getFromSessionByKey = plugin.__get__(
  'getFromSessionByKey',
);

const pluginSchemaEnabled = new mongoose.Schema(
  {
    name: String,
  },
  {
    ownership: true,
    group: 'company',
  },
);

beforeAll(async () => {
  mongoose.plugin(plugin);
  get = jest.spyOn(ctx, 'get');
  Model = mongoose.model('Demo', pluginSchemaEnabled);
  await mongoose.connect(process.env.CONNECTION);
});

beforeEach(() => {
  get.mockReset();
});

describe('request-context lookup', () => {
  it('should return id', () => {
    get.mockReturnValue({ id: 1 });
    expect(getFromSessionByKey('id')).toBe(1);
  });

  it('should return null', () => {
    expect(getFromSessionByKey('foo')).toBeNull();
  });
});

describe('preSave', () => {
  it('should append createdBy meta', async () => {
    get.mockReturnValue({ id });
    const doc = await Model.create({ name: 'Jon' });
    expect(doc).toHaveProperty('createdBy', id);
  });

  it('preserve createdBy meta', async () => {
    get.mockReturnValue({ id });
    const doc = await Model.create({ name: 'Jon' });
    doc.createdBy = company;
    expect(await doc.save()).toHaveProperty(
      'createdBy',
      company,
    );
  });
});

describe('preFind', () => {
  const mockWhere = async (expected) => {
    const query = Model.findOne();
    const spy = jest.fn().mockReturnValue(query);
    query.where = spy;
    await query.exec();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining(expected),
    );
  };

  it('should append createdBy meta', async () => {
    get.mockReturnValue({
      ownership: 'Own',
      id,
    });

    await mockWhere({
      createdBy: id,
    });
  });

  it('should append ownedBy meta', async () => {
    get.mockReturnValue({
      ownership: 'Shared',
      company,
    });

    await mockWhere({
      ownedBy: company,
    });
  });
});
