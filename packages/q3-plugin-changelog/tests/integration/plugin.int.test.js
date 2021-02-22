const mongoose = require('mongoose');
const Model = require('../fixtures/Model');
const plugin = require('../../lib');

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
  // eslint-disable-next-line
  require('../../lib/changestream')();
});

afterAll(() => {
  mongoose.disconnect();
});

describe('changelog', () => {
  it('should', async (done) => {
    const doc = await Model.create({
      title: 'New',
    });

    const changeOps = [
      {
        title: 'New Tesla announced',
      },
      {
        topics: [
          { name: 'Entertainment' },
          { name: 'Cars' },
          { name: 'Politics' },
          { name: 'Energy' },
        ],
      },
      {
        $pull: {
          topics: {
            name: 'Cars',
          },
        },
      },
    ];

    await Promise.all(
      changeOps.map((args) =>
        Model.updateOne({ _id: doc._id }, args),
      ),
    );

    setTimeout(async () => {
      const logs = await doc.getHistory();

      expect(logs).toHaveLength(changeOps.length);
      expect(logs).toHaveProperty(
        '0.modifiedBy',
        'Jon Doe',
      );

      done();
    }, 200);
  });

  it('should return array of paths', async () =>
    expect(Model.getChangelogProperties()).toHaveLength(2));

  it('should return null', async () => {
    const TempSchema = new mongoose.Schema({});
    TempSchema.plugin(plugin);

    expect(
      mongoose
        .model('without-change', TempSchema)
        .getChangelogProperties(),
    ).toBeNull();
  });
});
