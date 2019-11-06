const { Schema } = require('mongoose');
const AWSInterface = require('../../config/aws');

const FileSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      systemOnly: true,
    },
    sensitive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    getters: true,
  },
);

FileSchema.virtual('url').get((value, v, doc) => {
  const sdk = AWSInterface();

  const method = doc.sensitive
    ? sdk.getPrivate
    : sdk.getPublic;

  return method(`${doc.parent().id}/${doc.name}`);
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
    ? sdk.getPublic(`${doc.id}/${doc.featuredUpload}`)
    : null;
});

module.exports = UploadSchema;
