const mongoose = require('mongoose');

module.exports = mongoose.model(
  'characters',
  new mongoose.Schema(
    {
      name: String,
      role: String,
      friends: [
        {
          name: String,
        },
      ],
    },
    {
      restify: '*',
      collectionSingularName: 'character',
      collectionPluralName: 'characters',
    },
  ),
);
