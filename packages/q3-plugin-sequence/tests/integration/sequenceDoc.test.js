const mongoose = require('mongoose');
const { DocumentSequence } = require('../../lib');

let Counter;
const Schema = new mongoose.Schema({
  name: String,
});

Schema.plugin(DocumentSequence);

const Model = mongoose.model('sequences-parents', Schema);

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
  Counter = mongoose.connection.db.collection('counters');
});

beforeEach(async () => {
  await Counter.deleteMany({});
});

afterAll(() => {
  mongoose.disconnect();
});

describe('sequential', () => {
  it('should increment based on previous', async () => {
    const docs = await Model.create([
      {
        name: 'foo',
      },
      {
        name: 'bar',
      },
    ]);

    expect(docs[0]).toHaveProperty('seq', 1);
    expect(docs[1]).toHaveProperty('seq', 2);
  });

  it('should increment based on external counters', async () => {
    await Counter.insert({
      collectionName: 'sequences-parents',
      seq: 98,
    });

    const docs = await Model.create({
      name: 'foo',
    });

    expect(docs).toHaveProperty('seq', 99);
  });
});
