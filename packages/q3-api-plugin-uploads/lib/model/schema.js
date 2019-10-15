const { Schema } = require('mongoose');

module.exports = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sensitive: {
      type: Boolean,
      default: false,
    },
    topic: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'model',
    },
    model: {
      type: String,
      required: true,
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
