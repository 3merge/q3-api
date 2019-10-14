const { Router } = require('express');
const getAll = require('./get');
const deleteMany = require('./delete');
const deleteOne = require('./delete.id');
const create = require('./post');
const updateOne = require('./put.id');

module.exports = (collectionName) => {
  const app = Router();

  app
    .route('/:documentID/addresses')
    .post(create(collectionName))
    .get(getAll(collectionName))
    .delete(deleteMany(collectionName));

  app
    .route('/:documentID/addresses/:addressID')
    .put(updateOne(collectionName))
    .delete(deleteOne(collectionName));

  return app;
};
