const AWSInterface = require('./aws');
const {
  PRIVATE_FILES,
  PUBLIC_FILES,
} = require('./constants');

const promiseInBulk = (files = [], cb) =>
  Promise.all(files.map(cb));

const mapFileName = (files = {}) =>
  Object.entries(files).map(([key, value]) =>
    Object.assign(value, {
      name: key + value.name,
    }),
  );

class FileUploadAdapter {
  $executeUpload(files, upload, field) {
    const a = mapFileName(files);
    return promiseInBulk(a, upload).then((resp = []) => {
      if (!this[field] || !this[field].length) {
        this[field] = resp;
      } else {
        resp.forEach((url) => {
          this[field].addToSet(url);
        });
      }

      return this.save();
    });
  }

  async handleFeaturedPhoto(file) {
    if (!file) return null;
    this.featuredPhoto = await AWSInterface().putPublic(
      file,
    );
    return this.save();
  }

  async handlePublicFiles(files) {
    return this.$executeUpload(
      files,
      AWSInterface().putPublic,
      'publicFiles',
    );
  }

  async handlePrivateFiles(files) {
    return this.$executeUpload(
      files,
      (file) => AWSInterface().putPrivate(this.id, file),
      'privateFiles',
    );
  }
}

module.exports = (schema) => {
  schema.add({
    featuredPhoto: String,
    [PUBLIC_FILES]: {
      type: [String],
    },
    [PRIVATE_FILES]: {
      type: [String],
      select: false,
    },
  });

  schema.loadClass(FileUploadAdapter);
  return schema;
};
