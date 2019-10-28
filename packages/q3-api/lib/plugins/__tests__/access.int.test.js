const ctx = require('request-context');
const mongoose = require('mongoose');
const plugin = require('../access');

let Model;
let get;
const id = mongoose.Types.ObjectId();
const company = mongoose.Types.ObjectId();

const pluginSchemaEnabled = new mongoose.Schema(
  {
    name: String,
    belongs: mongoose.Types.ObjectId,
  },
  {
    enableOwnership: true,
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

describe('Save middleware', () => {
  it('should append createdBy meta', async () => {
    get.mockReturnValue({ user: { id } });
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

describe('Find middleware', () => {
  it('should append createdBy meta', async () => {
    get.mockReturnValue({
      grants: {
        ownership: 'Own',
      },
      user: {
        id,
      },
    });

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
    get.mockReturnValue({
      grants: {
        ownership: 'Own',
        ownershipAliases: [
          {
            local: 'belongs',
            foreign: 'group',
          },
        ],
      },
      user: {
        id,
        group: 'foo',
      },
    });

    const query = Model.findOne();
    const spy = jest.fn().mockReturnValue(query);
    query.or = spy;
    await query.exec();

    expect(spy).toHaveBeenCalledWith([
      { belongs: 'foo' },
      { createdBy: id },
    ]);
  });

  it('should skip all authorization', async () => {
    get.mockReturnValue({
      grants: {
        ownership: 'Any',
      },
    });

    const query = Model.findOne();
    query.where = jest.fn();
    query.or = jest.fn();
    await query.exec();

    expect(query.where).not.toHaveBeenCalled();
    expect(query.or).not.toHaveBeenCalled();
  });
});

describe('Plugin integration test', () => {
  const seedDB = async (o) => {
    get.mockReturnValue(o);

    await Model.create([
      { name: 'Foo', belongs: id },
      { name: 'Bar', belongs: id },
      { name: 'Quux' },
    ]);
  };

  beforeEach(async () => {
    await Model.deleteMany({});
  });

  it('should filter by belongs property', async () => {
    const session = {
      grants: {
        ownership: 'Own',
        ownershipAliases: [
          {
            local: 'belongs',
            foreign: 'company',
          },
        ],
      },
      user: {
        id,
      },
    };

    await seedDB(session);
    await seedDB({
      ...session,
      user: {
        id: mongoose.Types.ObjectId(),
        company: id,
      },
    });

    expect(await Model.countDocuments().exec()).toBe(5);
  });

  it('should filter by creator', async () => {
    const newID = mongoose.Types.ObjectId();
    const session = {
      grants: {
        ownership: 'Own',
      },
      user: {
        id,
      },
    };

    await seedDB(session);
    await seedDB({
      ...session,
      user: {
        id: newID,
      },
    });

    expect(await Model.countDocuments().exec()).toBe(3);
  });
});
