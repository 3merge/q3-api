/**
 * Amazon Web Services S3 cloud storage adpater for Q3 core filemanager.
 * @mixin S3Adapter
 */
const config = require('./config');

const S3Adapter = () => {
  const {
    CDN: publicUrl,
    PRIVATE_BUCKET: PrivateBucket,
    PUBLIC_BUCKET: PublicBucket,
    S3_ACCESS_KEY_ID: accessKeyId,
    S3_SECRET: secretAccessKey,
    S3_REGION: s3Region,
    S3_VERSION: signatureVersion,
  } = process.env;

  const s3 = config({
    accessKeyId,
    s3Region,
    secretAccessKey,
    signatureVersion,
  });

  return {
    /**
     * Add file buffer to S3 bucket.
     * @memberof S3Adapter
     * @param {Object} meta Information about the file object
     * @param {Buffer} meta.data The file buffer data
     * @param {String} meta.filename The S3 "Key"
     * @param {Boolean} [meta.sensitive=false] Determines if the file saves to a Public or Private bucket
     * @example
     * const S3Adapter = require('@3merge/adapter-s3');
     *
     * S3Adapter()
     *  .add({
     *    data: Buffer.from(...),
     *    filename: 'foo.js',
     *    sensitive: true,
     *  })
     *  .then((name) => {
     *    console.log(name)
     *  });
     */
    add({ data, filename, sensitive }) {
      const meta = sensitive
        ? {
            ServerSideEncryption: 'AES256',
            Bucket: PrivateBucket,
          }
        : {
            ACL: 'public-read',
            Bucket: PublicBucket,
          };

      return new Promise((resolve, reject) =>
        s3.putObject(
          {
            ...meta,
            Body: Buffer.from(data),
            Key: filename,
          },
          (err) => {
            if (err) reject(err);
            resolve(filename);
          },
        ),
      );
    },

    copy() {},

    /**
     * Get the HTTP address where the file can be viewed/downloaded.
     * @memberof S3Adapter
     * @param {Object} meta Information about the file object
     * @param {String} meta.filename The S3 "Key"
     * @param {Boolean} [meta.sensitive=false] Determines if the file resides in the Public or Private bucket
     * @example
     * const S3Adapter = require('@3merge/adapter-s3');
     *
     * S3Adapter().get({
     *    filename: 'foo.js',
     *    sensitive: true,
     * });
     */
    get: ({ filename, sensitive = false }) =>
      sensitive
        ? `${publicUrl}/${filename}`
        : s3.getSignedUrl('getObject', {
            Expires: 86400,
            Bucket: PrivateBucket,
            Key: filename,
          }),

    remove() {},
  };
};

module.exports = S3Adapter;
