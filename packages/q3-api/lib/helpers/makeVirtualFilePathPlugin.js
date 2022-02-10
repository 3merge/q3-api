const { get } = require('lodash');
const AWSInterface = require('../config/aws');
const { replaceSpaces } = require('./utils');

module.exports = (Schema, path) => {
  const referencePath = `${path}FilePath`;

  Schema.add({
    [referencePath]: String,
  });

  Schema.virtual(path).get((_x, _y, doc = {}) => {
    const sdk = AWSInterface();
    const bucketKey = get(doc, referencePath);

    return bucketKey &&
      !['null', 'undefined'].includes(String(bucketKey))
      ? replaceSpaces(
          sdk.getPublic(`${doc._id}/${bucketKey}`),
        )
      : null;
  });
};
