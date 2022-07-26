const { Schema } = require('mongoose');
const { get } = require('lodash');
const AWSInterface = require('../../config/aws');
const { replaceSpaces } = require('../../helpers/utils');

const FileSchema = new Schema(
  {
    name: {
      type: String,
    },
    sensitive: {
      type: Boolean,
      default: false,
    },
    size: Number,
    folder: {
      type: Boolean,
      default: false,
    },
    folderId: Schema.Types.ObjectId,
    bucketId: {
      type: String,
    },
  },
  {
    timestamps: true,
    getters: true,
  },
);

FileSchema.virtual('relativePath');
FileSchema.virtual('url').get((value, v, doc) => {
  try {
    const sdk = AWSInterface();
    const method = doc.sensitive
      ? sdk.getPrivate
      : sdk.getPublic;

    return method(
      `${doc.parent().id}/${get(
        doc,
        'bucketId',
        doc.name,
      )}`,
    );
  } catch (e) {
    return null;
  }
});

const UploadSchema = new Schema({
  uploads: {
    type: [FileSchema],
    select: false,
  },
  featuredUpload: {
    type: String,
  },
});

UploadSchema.virtual('photo').get((value, v, doc) => {
  const sdk = AWSInterface();
  return doc.featuredUpload
    ? replaceSpaces(
        sdk.getPublic(`${doc._id}/${doc.featuredUpload}`),
      )
    : null;
});

module.exports = UploadSchema;
