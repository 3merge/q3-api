const AWSInterface = require('../aws');

module.exports = (schema) => {
  schema.add({
    featuredPhoto: String,
  });

  // eslint-disable-next-line
  schema.methods.setFeaturedPhoto = async function uploadToAWS(
    v,
  ) {
    if (!v) return null;
    const aws = AWSInterface();
    const key = `${this.collection.collectionName}/${this.id}/${v.name}`;
    await aws.addToBucket(false)([key, v]);

    this.set('featuredPhone', key);
    await this.save();
    return aws.getPublic(key);
  };
};
