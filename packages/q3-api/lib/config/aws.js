const AWS = require('aws-sdk');
const { isObject } = require('lodash');
const moment = require('moment');

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

  const encodePlusSign = (str) =>
    String(str).replace(/\+/g, '%2B');

  return {
    getBuffer(Key) {
      return new Promise((resolve, reject) =>
        s3.getObject(
          {
            Bucket: process.env.PRIVATE_BUCKET,
            Key,
          },
          (error, data) =>
            error ? reject(error) : resolve(data.Body),
        ),
      );
    },

    getPublic(Key) {
      return `${process.env.CDN}/${encodePlusSign(Key)}`;
    },

    getPrivate(Key) {
      return s3.getSignedUrl('getObject', {
        Expires: 86400, // one day
        Bucket: PrivateBucket,
        Key,
      });
    },

    getSignedUrl(Key, ContentType) {
      return s3.getSignedUrl('putObject', {
        Bucket: PrivateBucket,
        ContentType,
        Key,
        Expires: 86400, // one day
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

    async exists(Key) {
      return s3
        .headObject({
          Bucket: process.env.PRIVATE_BUCKET,
          Key,
        })
        .promise()
        .then(() => true)
        .catch(() => false);
    },

    /**
     * @TODO
     * Refactor with above methods.
     * This was brought in temporarily from a separate project.
     */
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

    bulk(files, bucket) {
      return isObject(files)
        ? Promise.all(
            Object.entries(files).map(
              async ([key, file]) => {
                const filename = `${bucket}/${moment().valueOf()}/${key}`;
                await this.add(filename, file.data);
                return filename;
              },
            ),
          )
        : [];
    },
  };
};
