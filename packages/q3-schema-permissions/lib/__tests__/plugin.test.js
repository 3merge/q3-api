const globalizedPlugin = require('q3-schema-utils/plugins/common');
const mongoose = require('mongoose');
const plugin = require('../plugin');
const PermissionSchema = require('..');

jest.unmock('request-context');

let id;
const userID = mongoose.Types.ObjectId();

const coll = 'AccessControlPlugin';
const lookup = 'Permissions';
const role = 'Dev';

const Schema = new mongoose.Schema({
  belongs: mongoose.Types.ObjectId,
  specialCondition: Number,
  name: String,
});

mongoose.plugin(globalizedPlugin);
Schema.plugin(plugin, {
  lookup,
  getUser: () => ({
    _id: userID,
    isReady: false,
    role,
  }),
});

const Model = mongoose.model('AccessControlPlugin', Schema);
const PermissionModel = mongoose.model(
  lookup,
  PermissionSchema,
);

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);

  ({ _id: id } = await PermissionModel.create({
    op: 'Read',
    fields: '*',
    coll,
    role,
  }));
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
  it('it should check user conditions', async () => {
    const name = 'OwnershipConditions';
    await Model.create({ name });
    await PermissionModel.findByIdAndUpdate(id, {
      ownershipConditions: ['isReady=true'],
    });
    return expect(
      Model.findOne({ name })
        .setOptions({ redact: true })
        .exec(),
    ).rejects.toThrowError();
  });

  it.only('it should check document conditions', async () => {
    const name = 'DocumentConditions';
    await Model.create([
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
    await PermissionModel.findByIdAndUpdate(id, {
      ownershipConditions: [],
      documentConditions: [
        'specialCondition>4',
        'name=SomethingElse',
      ],
    });

    await expect(
      Model.find().setOptions({ redact: true }).exec(),
    ).resolves.toHaveLength(2);
  });

  it('it should check document conditions on create', async () => {
    await PermissionModel.findByIdAndUpdate(id, {
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
      }).then(([r]) => r),
    ).resolves.toHaveProperty('_id');
  });
});
