const AWS = require('aws-sdk');

module.exports = () => {
  const {
    S3_ACCESS_KEY_ID: accessKeyId,
    S3_SECRET: secretAccessKey,
    PRIVATE_BUCKET: PrivateBucket,
    PUBLIC_BUCKET: PublicBucket,
  } = process.env;

  AWS.config.update({
    accessKeyId,
    secretAccessKey,
  });

  const s3 = new AWS.S3({
    signatureVersion: 'v4',
  });

  return {
    getPublic(Key) {
      return `${process.env.CDN}/${Key}`;
    },

    getPrivate(Key) {
      return s3.getSignedUrl('getObject', {
        Bucket: PrivateBucket,
        Key,
      });
    },

    addToBucket(p) {
      const meta = p
        ? {
            ServerSideEncryption: 'AES256',
            Bucket: PrivateBucket,
          }
        : {
            ACL: 'public-read',
            Bucket: PublicBucket,
          };

      return ([Key, { data, name }]) =>
        new Promise((resolve, reject) =>
          s3.putObject(
            {
              ...meta,
              Body: Buffer.from(data),
              Key,
            },
            (err) => {
              if (err) reject(err);
              resolve(name);
            },
          ),
        );
    },

    deleteByKey(Key, p = false) {
      return new Promise((resolve, reject) =>
        s3.deleteObject(
          {
            Bucket: p ? PrivateBucket : PublicBucket,
            Key,
          },
          (err) => {
            if (err) reject(err);
            resolve();
          },
        ),
      );
    },
  };
};
