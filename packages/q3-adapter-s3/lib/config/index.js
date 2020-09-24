const AWS = require('aws-sdk');

module.exports = ({
  accessKeyId,
  secretAccessKey,
  region = 'us-east-2',
  signatureVersion = 'v4',
}) => {
  AWS.config.update({
    accessKeyId,
    secretAccessKey,
  });

  const s3 = new AWS.S3({
    signatureVersion,
    region,
  });

  return s3;
};
