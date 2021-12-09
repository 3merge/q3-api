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
    tags: [String],
    relativePath: String,
  },
  {
    timestamps: true,
    getters: true,
  },
);

FileSchema.path('name').set(function savePreviousFileName(
  newVal,
) {
  if (this.$locals && this.name)
    this.$locals.prev = this.name;

  return newVal;
});

FileSchema.pre(
  'save',
  async function modifyS3OnNameChange() {
    try {
      if (this.isModified('name') && !this.isNew) {
        const sdk = AWSInterface();
        sdk.copyFrom(
          `${this.parent()._id}/${this.$locals.prev}`,
          `${this.parent()._id}/${this.name}`,
        );
      }
    } catch (e) {
      // noop
    }
  },
);

FileSchema.virtual('url').get((value, v, doc) => {
  try {
    const sdk = AWSInterface();
    const method = doc.sensitive
      ? sdk.getPrivate
      : sdk.getPublic;

    return method(`${doc.parent().id}/${doc.name}`);
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
    ? sdk.getPublic(`${doc._id}/${doc.featuredUpload}`)
    : null;
});

module.exports = UploadSchema;
