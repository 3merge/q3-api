const AWS = require('aws-sdk');

module.exports = () => {
  const {
    S3_ACCESS_KEY_ID: accessKeyId,
    S3_SECRET: secretAccessKey,
    PRIVATE_BUCKET: PrivateBucket,
    PUBLIC_BUCKET: PublicBucket,
    S3_REGION: s3Region,
  } = process.env;

  AWS.config.update({
    accessKeyId,
    secretAccessKey,
  });

  const s3 = new AWS.S3({
    signatureVersion: 'v4',
    region: s3Region || 'us-east-2',
  });

  return {
    getPublic(Key) {
      return `${process.env.CDN}/${Key}`;
    },

    getPrivate(Key) {
      return s3.getSignedUrl('getObject', {
        Expires: 86400, // one day
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

    getFrom(Key) {
      return s3
        .getObject({
          Bucket: process.env.PRIVATE_BUCKET,
          Key,
        })
        .createReadStream()
        .on('error', () => {
          // noop
        });
    },

    copyFrom(prevKey, newKey) {
      s3.copyObject(
        {
          CopySource: `${process.env.PRIVATE_BUCKET}/${prevKey}`,
          Bucket: process.env.PRIVATE_BUCKET,
          Key: newKey,
        },
        () => {
          // noop
          // will need to improve this...
        },
      );
    },

    add(Key, data) {
      return new Promise((resolve, reject) =>
        s3.putObject(
          {
            ServerSideEncryption: 'AES256',
            Bucket: process.env.PRIVATE_BUCKET,
            Body: Buffer.from(data),
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
