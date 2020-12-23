const { getGramCollection } = require('./helpers');
const save = require('./save');

module.exports = (fields = []) =>
  async function setupMongooseTextIndex() {
    await getGramCollection(this).createIndex(
      { 'ngrams': 'text' },
      { sparse: true },
    );

    return new Promise((resolve, reject) => {
      this.find()
        .stream()
        .on('data', (doc) =>
          save(fields).call({
            ...this,
            ...doc,
          }),
        )
        .on('error', () => {
          reject();
        })
        .on('end', () => {
          resolve();
        });
    });
  };
