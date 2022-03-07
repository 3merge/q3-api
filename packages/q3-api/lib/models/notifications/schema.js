const { Schema } = require('mongoose');

module.exports = new Schema(
  {
    hasSeen: Boolean,
    hasDownloaded: Boolean,
    messageType: String,
    documentId: Schema.Types.ObjectId,
    subDocumentId: Schema.Types.ObjectId,
    userId: Schema.Types.ObjectId,
    dismissedOn: Date,
    label: String,
    path: String,
    excerpt: String,
  },
  {
    timestamps: true,
  },
);
