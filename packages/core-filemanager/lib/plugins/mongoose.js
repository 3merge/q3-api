const { Schema } = require('mongoose');
const mongooseHelpers = require('./mongoose-helpers');

const FileSchema = new Schema({
  name: {
    type: String,
    required: true,
    systemOnly: true,
  },
  relativePath: {
    type: String,
  },
  sensitive: {
    type: Boolean,
    default: false,
  },
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

module.exports = (Adapter) => (mongooseSchema) => {
  const helpers = mongooseHelpers(Adapter);

  Object.values(helpers).forEach((fn) => {
    FileSchema.methods[fn.name] = fn;
  });

  mongooseSchema.add(UploadSchema);
};

/**


  FileSchema.methods.handleFeaturedUpload = async ({
    files,
  }) => {
    const sdk = AWSInterface();
    const file = files[Object.keys(files)[0]];

    const method = sdk.addToBucket();
    const response = await method([
      `${this.id}/${file.name}`,
      file,
    ]);

    this.featuredUpload = response;
    return this.save();
  };

  FileSchema.methods.getFilePath = (relativePath) => {
    if (!this.uploads || !Array.isArray(this.uploads))
      return undefined;

    return this.uploads.find((item) => {
      return item.relativePath
        ? item.relativePath.startsWith(relativePath)
        : false;
    }).name;
  };

  FileSchema.methods.handleReq = async ({
    body,
    files,
  }) => {
    if (files && this.handleFeaturedUpload) {
      if (files.featuredUpload)
        await this.uploadFeaturePhotoFile(
          files.featuredUpload,
        );
      else
        await this.handleUpload({
          files,
        });
    }

    if (body.featuredUpload === null)
      this.set({
        featuredUpload: undefined,
        photo: undefined,
      });
  };

  FileSchema.path('name').set(function savePreviousFileName(
    newVal,
  ) {
    if (this.$locals && this.name)
      this.$locals.prev = this.name;

    return newVal;
  });

  FileSchema.virtual('url').get((value, v, doc) => {
    try {
      return Adapter.get({
        filename: `${doc.parent().id}/${doc.name}`,
        sensitive: doc.sensitive,
      });
    } catch (e) {
      return null;
    }
  });

  UploadSchema.virtual('photo').get((value, v, doc) => {
    return doc.featuredUpload
      ? Adapter.get({
          filename: `${doc.id}/${doc.featuredUpload}`,
          sensitive: false,
        })
      : null;
  });



 */
