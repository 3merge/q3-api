const { Schema } = require('mongoose');

module.exports = new Schema(
  {
    active: Boolean,
    read: Boolean,
    archived: Boolean,
    messageType: String,
    documentId: Schema.Types.ObjectId,
    subDocumentId: Schema.Types.ObjectId,
    userId: Schema.Types.ObjectId,
    label: String,
    path: String,
    excerpt: String,
    localUrl: String,
  },
  {
    timestamps: true,
    restify: '*',
    disableChangelog: true,
    collectionSingularName: 'notification',
    collectionPluralName: 'notifications',
    strict: false,
  },
);
