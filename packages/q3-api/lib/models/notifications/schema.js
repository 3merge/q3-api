const { Schema } = require('mongoose');

const NotificationSchema = new Schema(
  {
    active: {
      type: Boolean,
      default: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    messageType: String,
    documentId: Schema.Types.ObjectId,
    subDocumentId: Schema.Types.ObjectId,
    userId: Schema.Types.ObjectId,
    label: String,
    path: String,
    excerpt: String,
    localUrl: String,
    url: String,
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

module.exports = NotificationSchema;
