const { get } = require('lodash');
const BatchQueryLoader = require('./BatchQueryLoader');

module.exports = (schema) => {
  async function autopopulate(doc) {
    const batch = new BatchQueryLoader(schema);

    if (
      batch.isReady &&
      !get(this, 'options.skipAutocomplete', false)
    ) {
      const docs = [].concat(doc);
      docs.map(batch.registerIds.bind(batch));
      await batch.fetch();
      docs.map(batch.assign.bind(batch));
    }
  }

  schema
    .post('find', autopopulate)
    .post('findOne', autopopulate)
    .post('findOneAndUpdate', autopopulate)
    .post('save', autopopulate);
};
