const AWSInterface = require('../aws');

module.exports = (schema) => {
  schema.add({
    featuredPhoto: String,
  });

  // hooks
  // const uploader = AWSInterface();
  schema.pre('save');
  schema.pre('find');

  /**
    async handleFeaturedPhoto(file) {
    if (!file) return null;
    this.featuredPhoto = await AWSInterface().putPublic(
      file,
    );
    return this.save();
  }
   */
};
