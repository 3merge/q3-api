const mongoose = require('mongoose');
const plugin = require('../../lib');

const TestSchema = new mongoose.Schema({});
TestSchema.plugin(plugin);

const TestModel = mongoose.model('test', TestSchema);

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
});

afterAll(() => {
  mongoose.disconnect();
});

describe('Comments', () => {
  it('should remove message from response', async () => {
    const doc = await TestModel.create({
      comments: [
        {
          message: 'Sample',
        },
      ],
    });

    doc.comments[0].removed = true;
    await doc.save();

    const found = await TestModel.find().lean();
    expect(doc.comments[0].message).toBeUndefined();
    expect(found[0].comments[0].message).toBeUndefined();

    doc.comments[0].removed = false;
    await doc.save();

    const foundAgain = await TestModel.find().lean();
    expect(doc.comments[0].message).toBe('Sample');
    expect(foundAgain[0].comments[0].message).toBe(
      'Sample',
    );
  });
});
