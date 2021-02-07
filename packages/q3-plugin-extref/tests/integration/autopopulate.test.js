const mongoose = require('mongoose');
const { autopopulate } = require('../../lib');

let M;
let D;

beforeAll(async () => {
  mongoose.plugin(autopopulate);
  await mongoose.connect(process.env.CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  M = mongoose.model(
    'Foo',
    new mongoose.Schema({
      name: String,
      reference: {
        autopopulate: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Foo',
      },
      embeddedReference: [
        new mongoose.Schema({
          secondReference: {
            autopopulate: true,
            autopopulateSelect: 'name',
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Foo',
          },
        }),
      ],
    }),
  );

  D = M.discriminator(
    'FooBar',
    new mongoose.Schema({
      code: String,
      discriminatedReference: {
        autopopulate: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Foo',
      },
    }),
  );
});

describe('Autopopulate', () => {
  it('should return embedded document', async (done) => {
    const [{ _id: doc }, { _id: ref }] = await M.create([
      { name: 'First ' },
      { name: 'Second' },
    ]);

    const resp = await M.findByIdAndUpdate(
      doc,
      {
        reference: ref,
        embeddedReference: [{ secondReference: ref }],
      },
      { new: true },
    ).exec();

    expect(resp.reference).toBeDefined();
    expect(resp.reference).toHaveProperty('name');
    expect(resp.embeddedReference).toHaveLength(1);
    expect(
      resp.embeddedReference[0].secondReference,
    ).toHaveProperty('name');
    done();
  });

  it('should return embedded document on discriminator', async (done) => {
    const { _id: discriminatedReference } = await D.create({
      name: 'Target',
    });
    const { _id: query } = await D.create({
      name: 'Third',
      code: '100',
      discriminatedReference,
    });

    const resp = await M.findById(query)
      .lean()
      .exec();

    expect(resp.discriminatedReference).toBeDefined();
    expect(resp.discriminatedReference).toHaveProperty(
      'name',
    );
    done();
  });

  it('should return embedded documents on save', async (done) => {
    const { _id: secondReference } = await M.create({
      name: 'Target ',
    });

    const { embeddedReference } = await M.create({
      name: 'Target',
      embeddedReference: [
        {
          secondReference,
        },
      ],
    });

    expect(embeddedReference).toHaveLength(1);
    expect(
      embeddedReference[0].secondReference,
    ).toHaveProperty('name');
    done();
  });

  it('should populate list', async (done) => {
    const [{ embeddedReference }] = await M.find()
      .lean()
      .exec();

    expect(embeddedReference).toHaveLength(1);
    expect(
      embeddedReference[0].secondReference,
    ).toHaveProperty('name');
    done();
  });
});
