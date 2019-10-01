const AWS = require('aws-sdk');

const AWSInterface = () => {
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

  const appendCDN = (name, skip) =>
    skip ? name : `${process.env.CDN}/${name}`;

  const putAsPromise = (name, params) =>
    new Promise((resolve, reject) =>
      s3.putObject(params, (err) => {
        if (err) reject(err);
        resolve(name);
      }),
    );

  const getAsPromise = (params) =>
    new Promise((resolve, reject) =>
      s3.listObjects(params, (err, data = {}) => {
        if (err) reject(err);
        resolve(data.Contents.map(({ Key }) => Key));
      }),
    );

  const deleteAsPromise = (params) =>
    new Promise((resolve, reject) =>
      s3.deleteObject(params, (err) => {
        if (err) reject(err);
        resolve();
      }),
    );

  return {
    getPrivate(id, fileName) {
      return s3.getSignedUrl('getObject', {
        Key: `${id}/${fileName}`,
        Bucket: PrivateBucket,
      });
    },

    listPrivate(id) {
      return getAsPromise({
        Prefix: id,
        Bucket: PrivateBucket,
      });
    },

    listPublic() {
      return getAsPromise({
        Bucket: PublicBucket,
      }).then((resp) => resp.map(appendCDN));
    },

    putPrivate(id, { data, name }) {
      return putAsPromise(name, {
        ServerSideEncryption: 'AES256',
        Key: `${id}/${name}`,
        Body: data,
        Bucket: PrivateBucket,
      });
    },

    putPublic({ name, data }) {
      return putAsPromise(name, {
        ACL: 'public-read',
        Key: name,
        Body: data,
        Bucket: PublicBucket,
      }).then(appendCDN);
    },

    deletePrivate(id, Key) {
      return deleteAsPromise({
        Bucket: PrivateBucket,
        Key: `${id}/${Key}`,
      });
    },

    deletePublic(Key) {
      return deleteAsPromise({
        Bucket: PublicBucket,
        Key,
      });
    },
  };
};

module.exports = AWSInterface;
