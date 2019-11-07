const mongoose = require('../../config/mongoose');
const plugin = require('../autopopulate');

let M;
let D;

beforeAll(async () => {
  mongoose.plugin(plugin);
  await mongoose.connect(process.env.CONNECTION);

  M = mongoose.model(
    'Foo',
    new mongoose.Schema({
      name: String,
      reference: {
        autopopulate: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Foo',
      },
      embeddedReference: new mongoose.Schema({
        secondReference: {
          autopopulate: true,
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Foo',
        },
      }),
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
  it('should return embedded document', async () => {
    const [{ _id: doc }, { _id: ref }] = await M.create([
      { name: 'First ' },
      { name: 'Second' },
    ]);

    const resp = await M.findByIdAndUpdate(
      doc,
      { reference: ref },
      { new: true },
    );

    expect(resp.reference).toBeDefined();
    expect(resp.reference).toHaveProperty('name');
  });

  it('should return embedded document on discriminator', async () => {
    const { _id: discriminatedReference } = await D.create({
      name: 'Target',
    });
    const { _id: query } = await D.create({
      name: 'Third',
      code: '100',
      discriminatedReference,
    });

    const resp = await M.findById(query).exec();

    expect(resp.discriminatedReference).toBeDefined();
    expect(resp.discriminatedReference).toHaveProperty(
      'name',
    );
  });
});