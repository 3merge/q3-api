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

    await Model.updateOne(
      {
        _id,
      },
      {
        title: 'Newer',
      },
    );

    setTimeout(async () => {
      console.log(
        await getFromChangelog(
          Model.collection.collectionName,
        ),
      );
      done();
    }, 200);
  });
});
