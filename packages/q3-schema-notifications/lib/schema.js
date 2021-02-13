const { Schema } = require('mongoose');

module.exports = new Schema(
  {
    hasSeen: Boolean,
    hasDownloaded: Boolean,
    userId: Schema.Types.ObjectId,
    label: String,
    path: String,
  },
  {
    timestamps: true,
  },
);
