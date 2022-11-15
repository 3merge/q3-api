const { Schema } = require('mongoose');

module.exports = new Schema(
  {
    notifications: Number,
    userId: Schema.Types.ObjectId,
  },
  {},
);
