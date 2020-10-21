const { Schema } = require('mongoose');

const {
  Types: { ObjectId },
} = Schema;

module.exports = new Schema(
  {
    event: {
      type: String,
      required: true,
    },
    interval: {
      type: String,
    },
    lastRan: {
      type: Date,
    },
    runsNext: {
      type: Date,
    },
    ref: {
      type: ObjectId,
    },
  },
  {
    timestamps: false,
  },
);
