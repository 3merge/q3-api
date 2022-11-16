const { Schema } = require('mongoose');

const NotificationSchema = new Schema(
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

NotificationSchema.virtual('url');
module.exports = NotificationSchema;
