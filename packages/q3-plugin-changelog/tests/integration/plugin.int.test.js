const mongoose = require('mongoose');
const Model = require('../fixtures/Model');
const {
  getFromChangelog,
} = require('../../lib/changestream');

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
});

afterAll(() => {
  mongoose.disconnect();
});

describe('changelog', () => {
  it('should', async (done) => {
    const { _id } = await Model.create({
      title: 'New',
    });

    const update = (args) => Model.updateOne({ _id }, args);

    await update({
      title: 'New Tesla announced',
    });

    await Model.update({
      topics: [
        { name: 'Entertainment' },
        { name: 'Cars' },
        { name: 'Politics' },
        { name: 'Energy' },
      ],
    });

    await Model.update({
      $pull: {
        topics: {
          name: 'Cars',
        },
      },
    });

    await Model.update({
      title: 'Stock soars',
      'topics.0.name': 'Business',
    });

    setTimeout(async () => {
      const logs = await getFromChangelog(
        Model.collection.collectionName,
      );

      expect(logs).toHaveLength(4);
      expect(logs).toHaveProperty('0.diff.0.kind', 'N');
      expect(logs).toHaveProperty('1.diff.0.kind', 'N');
      expect(logs).toHaveProperty('2.diff.0.kind', 'A');

      done();
    }, 200);
  });
});
