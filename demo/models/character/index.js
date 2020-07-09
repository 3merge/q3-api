const mongoose = require('mongoose');

module.exports = mongoose.model(
  'characters',
  new mongoose.Schema(
    {
      name: {
        type: String,
        searchable: true,
      },
      role: String,
      gender: String,
    },
    {
      restify: '*',
      collectionSingularName: 'character',
      collectionPluralName: 'characters',
    },
  ),
);
