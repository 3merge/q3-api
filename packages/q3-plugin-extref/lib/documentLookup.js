const BatchQueryLoader = require('./BatchQueryLoader');

module.exports = (schema) => {
  async function autopopulate(doc) {
    const batch = new BatchQueryLoader(schema);

    if (batch.isReady) {
      // works for both find and findOne this way
      const docs = [].concat(doc);

      // load up all the unique IDs per model to ensure we don't overfetch
      docs.map(batch.registerIds.bind(batch));

      // get the data and store it
      await batch.fetch();

      // populate the references
      docs.map(batch.assign.bind(batch));
    }
  }

  schema
    .post('find', autopopulate)
    .post('findOne', autopopulate)
    .post('findOneAndUpdate', autopopulate)
    .post('save', autopopulate);
};
