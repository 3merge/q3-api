const globalizedPlugin = require('q3-schema-utils/plugins/common');
const mongoose = require('mongoose');
const plugin = require('../plugin');
const PermissionSchema = require('..');

const userID = mongoose.Types.ObjectId();

const coll = 'AccessControlPlugin';
const lookup = 'Permissions';
const role = 'Dev';
const firstName = 'John';

const Schema = new mongoose.Schema({
  belongs: mongoose.Types.ObjectId,
  featured: Boolean,
  specialCondition: Number,
  name: String,
});

mongoose.plugin(globalizedPlugin);
Schema.plugin(plugin, {
  lookup,
  getUser: () => ({
    _id: userID,
    isReady: false,
    firstName,
    role,
  }),
});

const Model = mongoose.model('AccessControlPlugin', Schema);
const PermissionModel = mongoose.model(
  lookup,
  PermissionSchema,
);

const genPermission = async (props) =>
  PermissionModel.create({
    op: 'Read',
    fields: '*',
    coll,
    role,
    ...props,
  });

const expectProhibitied = (docId) =>
  expect(
    Model.findById(docId)
      .setOptions({ redact: true })
      .exec(),
  ).rejects.toThrowError();

const expectAllowed = (docId) =>
  expect(
    Model.findById(docId)
      .setOptions({ redact: true })
      .exec(),
  ).resolves.toBeDefined();

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
});

afterEach(async () => {
  await PermissionModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('AccessControlPlugin configuration', () => {
  it('it should run access on save if options is set', () =>
    expect(
      Model.create(
        [{ op: 'Create', fields: '*', coll, role }],
        { redact: true },
      ),
    ).rejects.toThrowError());

  it('it should run access on find if set', async () =>
    expect(
      Model.find().setOptions({ redact: true }).exec(),
    ).resolves.toBeDefined());
});

describe('AccessControlPlugin integration', () => {
  it('it should merge conflicting rules', async () => {
    const target = await Model.create({
      name: firstName,
      specialCondition: 4,
      active: true,
      featured: false,
      belongs: userID,
    });

    await genPermission({
      ownership: 'Own',
      documentConditions: ['featured=false', 'name=John'],
      ownershipAliases: [
        {
          local: 'belongs',
          foreign: '_id',
        },
      ],
    });

    return expectAllowed(target.id);
  });

  it('it should check user conditions', async () => {
    const name = 'OwnershipConditions';
    const target = await Model.create({ name });
    await genPermission({
      ownershipConditions: ['isReady=true'],
    });

    return expectProhibitied(target.id);
  });

  it('it should check document conditions', async () => {
    const name = 'DocumentConditions';
    const target = await Model.create([
      {
        name,
        specialCondition: 6,
      },
      {
        name: 'SomethingElse',
        specialCondition: 1,
      },
      {
        name,
        specialCondition: 1,
      },
    ]);

    await genPermission({
      ownershipConditions: [],
      documentConditions: [
        'specialCondition>4',
        'name=SomethingElse',
      ],
    });

    return expectAllowed(target.id);
  });

  it('it should check document conditions on create', async () => {
    await genPermission({
      documentConditions: ['specialCondition>4'],
      op: 'Create',
    });

    await expect(
      Model.create([{ specialCondition: 2 }], {
        redact: true,
      }),
    ).rejects.toThrowError();

    await expect(
      Model.create([{ specialCondition: 7 }], {
        redact: true,
      }),
    ).resolves.toBeDefined();
  });
});
