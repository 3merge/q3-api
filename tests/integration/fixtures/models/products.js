const { Schema } = require('mongoose');
const { setModel } = require('q3-api');

module.exports = setModel(
  'products',
  new Schema(
    {
      sku: String,
      price: {
        retail: Number,
        msrp: Number,
      },
    },
    {
      restify: '*',
      collectionPluralName: 'products',
      collectionSingularName: 'product',
    },
  ),
);
