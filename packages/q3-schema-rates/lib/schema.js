const { Schema } = require('mongoose');

const RatesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      searchable: true,
    },
    value: {
      type: Number,
      required: true,
    },
    threshold: String,
    label: String,
    description: String,
    regions: [String],
  },
  {
    timestamps: true,
    collectionSingularName: 'rate',
    collectionPluralName: 'rates',
    restify: 'get delete patch',
  },
);

module.exports = RatesSchema;
