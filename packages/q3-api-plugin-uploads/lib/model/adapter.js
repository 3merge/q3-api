const { exception } = require('q3-api');
const AWSInterface = require('../aws');

const buildKey = ({ model, topic, name }) =>
  `${model}/${topic}/${name}`;

const throwOnMissing = (doc) => {
  if (!doc)
    exception('ResourceNotFound')
      .msg('unknownFileId')
      .throw();
};

module.exports = class FileUploadAdapter {
  static upload({ sensitive, files, ...rest }) {
    const sdk = AWSInterface();
    const method = sdk.addToBucket(sensitive);
    const data = Object.values(files).map((file) => [
      buildKey({ ...rest, ...file }),
      file,
    ]);

    return Promise.all(data.map(method)).then((keys) =>
      Promise.all(
        keys.map((name) =>
          this.create({
            ...rest,
            sensitive,
            name,
          }),
        ),
      ),
    );
  }

  static async findSignedById(id) {
    const sdk = AWSInterface();
    const doc = await this.findOne({
      archived: false,
      _id: id,
    });

    throwOnMissing(doc);
    const method = doc.sensitive
      ? sdk.getPrivate
      : sdk.getPublic;

    return method(buildKey(doc));
  }

  static async archive(id) {
    const doc = await this.findOne({
      archived: false,
      _id: id,
    });

    throwOnMissing(doc);
    doc.set({ archived: true });
    return doc.save();
  }

  static async findByTopic(args) {
    return this.find({
      archived: false,
      ...args,
    });
  }
};
