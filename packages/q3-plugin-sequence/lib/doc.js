const mongoose = require('mongoose');
const { get } = require('lodash');

module.exports = (Schema) => {
  async function getNextInSequentialOrder() {
    try {
      const { collectionName } = this.collection;
      const entry = await mongoose.connection.db
        .collection('counters')
        .findOneAndUpdate(
          {
            collectionName,
          },
          {
            $inc: {
              seq: 1,
            },
          },
          {
            new: true,
            returnOriginal: false,
            returnDocument: 'after',
            returnNewDocument: true,
            upsert: true,
          },
        );

      this.seq = get(entry, 'value.seq');
      if (!this.seq) throw new Error('Failed to increment');
    } catch (e) {
      const [entry] = await this.constructor
        .find()
        .sort({ seq: -1 })
        .limit(1)
        .lean()
        .exec();

      this.seq =
        entry && entry.seq ? Number(entry.seq) + 1 : 1;
    }

    return this;
  }

  async function setSequentialPropertyOnNew() {
    if (this.isNew) await this.getNextInSequentialOrder();
  }

  Schema.add({
    seq: {
      type: Number,
      gram: true,
    },
  });

  // eslint-disable-next-line
  Schema.methods.getNextInSequentialOrder =
    getNextInSequentialOrder;

  Schema.pre('save', setSequentialPropertyOnNew);
  return Schema;
};
