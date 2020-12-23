const { pick } = require('lodash');
const {
  getGramCollection,
  makeGram,
} = require('./helpers');

module.exports = (fields = []) =>
  async function preSaveMongooseHook() {
    const coll = getGramCollection(this);

    await coll.insert({
      origin: this._id,
      ngrams: makeGram(pick(this, fields)),
    });
  };
