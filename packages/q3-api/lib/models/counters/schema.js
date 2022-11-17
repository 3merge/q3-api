const { Schema } = require('mongoose');

module.exports = new Schema(
  {
    notifications: {
      type: Number,
      default: 0,
    },
    userId: {
      type: Schema.Types.ObjectId,
    },
  },
  {},
);
