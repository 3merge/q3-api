const MongooseAdapter = require('../lib');

beforeAll(async () => {
  MongooseAdapter.connect(process.env.CONNECTION);
});

describe('MongooseAdapter', () => {
  it('should alias mongoose on-save middleware', async () => {
    const m = MongooseAdapter.Factory.load({
      name: String,
      inc: Number,
    })
      .before(async (data) => {
        // eslint-disable-next-line
        data.inc += 1;
      })
      .during(async (data) => {
        expect(data).toHaveProperty('inc', 2);
        // eslint-disable-next-line
        data.inc += 1;
      })
      .after(async (data) => {
        expect(data).toHaveProperty('inc', 3);
      })
      .build('save-test');

    return m.create({
      name: 'Hero',
      inc: 1,
    });
  });

  it('should process post-find results', async () => {
    const m = MongooseAdapter.Factory.load({
      name: String,
      inc: Number,
    })
      .process(async (doc) => {
        // eslint-disable-next-line
        doc.onTheFly = true;
      })
      .build('find-test');

    await m.create([
      {
        name: 'Foo',
      },
      {
        name: 'Bar',
      },
    ]);

    const a = await m.findOne().lean().exec();
    const [b] = await m.find().exec();
    expect(a).toHaveProperty('onTheFly', true);
    expect(b).toHaveProperty('onTheFly', true);
  });
});
