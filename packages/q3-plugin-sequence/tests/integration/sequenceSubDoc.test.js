const mongoose = require('mongoose');
const { map } = require('lodash');
const {
  SubDocumentSequence,
  SubDocumentSequenceParentMiddleware,
} = require('../../lib');

const SubDoc = new mongoose.Schema({
  name: String,
});

const ParentDoc = new mongoose.Schema({
  name: String,
  embedded: [SubDoc],
});

SubDoc.plugin(SubDocumentSequence);
ParentDoc.plugin(
  SubDocumentSequenceParentMiddleware,
  'embedded',
);

const Model = mongoose.model('sequences', ParentDoc);

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
});

describe('SubDocumentSequenceParentMiddleware', () => {
  it('should shuffle the subdocs on save', async () => {
    const { embedded } = await Model.create({
      embedded: [
        {
          name: 'One',
        },
        {
          name: 'Two',
        },
      ],
    });

    expect(map(embedded, 'seq')).toEqual([1, 2]);
  });

  it('should reorder the subdocs on save', async () => {
    const doc = await Model.create({
      embedded: [
        {
          name: 'One',
        },
        {
          name: 'Two',
        },
        {
          name: 'Three',
        },
      ],
    });

    doc.embedded[1].seq = 1;
    const { embedded } = await doc.save();

    // would have swapped
    expect(map(embedded, 'seq')).toEqual([2, 1, 3]);
  });
});
