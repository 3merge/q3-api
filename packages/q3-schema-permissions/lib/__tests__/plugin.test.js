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
      Model.find()
        .setOptions({ redact: true })
        .exec(),
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

  it('it should check document conditions', async () => {
    const name = 'DocumentConditiosn';
    await Model.create({ name, specialCondition: 6 });
    await PermissionModel.findByIdAndUpdate(id, {
      ownershipConditions: [],
      documentConditions: ['specialCondition>4'],
    });
    return expect(
      Model.findOne({ name })
        .setOptions({ redact: true })
        .exec(),
    ).resolves.toHaveProperty('_id');
  });
});
