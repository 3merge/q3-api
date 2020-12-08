const mongoose = require('mongoose');
const { AccessControl, plugin } = require('../lib');

const userID = mongoose.Types.ObjectId();

const coll = 'AccessControlPlugin';
const role = 'Dev';
const firstName = 'John';

const Schema = new mongoose.Schema(
  {
    belongs: mongoose.Schema.Types.Mixed,
    featured: Boolean,
    specialCondition: Number,
    name: String,
  },
  {
    enableOwnership: true,
  },
);

/**
 * @NOTE
 * EMULATES Q3-core-session, which is REQUIRED.
 */
Schema.plugin((s) => {
  const copyToContext = function markPrivateContext() {
    this.__$q3 = {
      USER: {
        _id: userID,
        firstName: 'John',
        role,
      },
    };
  };

  s.pre('find', copyToContext);
  s.pre('findOne', copyToContext);
  s.pre('count', copyToContext);
  s.pre('countDocuments', copyToContext);
  s.pre('distinct', copyToContext);
  s.pre('save', copyToContext);
});

Schema.plugin(plugin);

const Model = mongoose.model('AccessControlPlugin', Schema);

const expectProhibitied = (docId) =>
  expect(
    Model.findById(docId)
      .setOptions({ redact: true })
      .exec(),
  ).resolves.toBeNull();

const expectAllowed = (docId) =>
  expect(
    Model.findById(docId)
      .setOptions({ redact: true })
      .exec(),
  ).resolves.toBeDefined();

const genPermission = (props) =>
  AccessControl.init(
    props.map((p) => ({
      fields: '*',
      coll,
      role,
      ...p,
    })),
  );

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
});

afterAll(async () => {
  AccessControl.purge();
  await mongoose.disconnect();
});

describe('AccessControlPlugin configuration', () => {
  it('it should run access on save if options is set', () => {
    genPermission([
      {
        op: 'Read',
      },
    ]);

    return expect(
      Model.create(
        [{ op: 'Create', fields: '*', coll, role }],
        { redact: true },
      ),
    ).rejects.toThrowError();
  });

  it('it should run access on find if set', async () => {
    genPermission([
      {
        op: 'Read',
      },
    ]);

    return expect(
      Model.find().setOptions({ redact: true }).exec(),
    ).resolves.toBeDefined();
  });
});

describe('AccessControlPlugin integration', () => {
  it('it should merge conflicting rules', async () => {
    genPermission([
      {
        ownership: 'Own',
        documentConditions: ['featured=false', 'name=John'],
        ownershipAliases: [
          {
            local: 'belongs',
            foreign: '_id',
            cast: 'toObject',
          },
        ],
        op: 'Create',
      },
      {
        op: 'Read',
      },
    ]);

    const [target] = await Model.create(
      [
        {
          name: firstName,
          specialCondition: 4,
          active: true,
          featured: false,
          belongs: userID,
        },
      ],
      {
        redact: true,
      },
    );

    return expectAllowed(target.id);
  });

  it('it should check user conditions', async () => {
    const name = 'OwnershipConditions';
    const target = await Model.create({
      name,
    });
    genPermission([
      {
        ownershipConditions: ['isReady=true'],
        op: 'Read',
      },
    ]);

    return expectProhibitied(target.id);
  });

  it('it should check document conditions', async () => {
    genPermission([
      {
        ownershipConditions: [],
        documentConditions: [
          'specialCondition>4',
          'name=SomethingElse',
        ],
        op: 'Read',
      },
    ]);

    const name = 'DocumentConditions';
    const target = await Model.create([
      {
        name: 'SomethingElse',
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

    await expectAllowed(target[0]._id);
    await expectProhibitied(target[1]._id);
    await expectProhibitied(target[2]._id);
  });

  it('it should check document conditions on create', async () => {
    genPermission([
      {
        documentConditions: ['specialCondition>4'],
        op: 'Create',
      },
    ]);

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
