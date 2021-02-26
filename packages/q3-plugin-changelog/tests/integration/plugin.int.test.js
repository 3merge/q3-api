const mongoose = require('mongoose');
const Model = require('../fixtures/Model');
const plugin = require('../../lib');

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
  // eslint-disable-next-line
  require('../../lib/changestream')();
});

afterEach(async () => {
  await mongoose.connection.db
    .collection('testing-changelog-patch-history')
    .deleteMany({});
});

afterAll(() => {
  mongoose.disconnect();
});

describe('changelog', () => {
  it('should', async (done) => {
    const doc = await Model.create({
      title: 'New',
    });

    const up = async (args) =>
      new Promise((r) => {
        setTimeout(async () => {
          await Model.updateOne({ _id: doc._id }, args);
          r();
        }, 50);
      });

    await up({
      title: 'New Tesla announced',
      lastModifiedBy: {
        firstName: 'Mike',
      },
    });

    await up({
      topics: [
        { name: 'Entertainment' },
        { name: 'Cars' },
        {
          name: 'Politics',
          publications: [
            {
              name: 'this',
            },
          ],
        },
      ],
    });

    await up({
      $pull: {
        topics: {
          name: 'Entertainment',
        },
      },
    });

    setTimeout(async () => {
      const logs = await doc.getHistory();
      expect(logs).toHaveLength(4);
      done();
    }, 500);
  });

  it('should return array of paths', async () =>
    // includes lastModifiedBy and updatedAt
    expect(Model.getChangelogProperties()).toHaveLength(5));

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
