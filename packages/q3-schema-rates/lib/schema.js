const { Schema } = require('mongoose');

const RatesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      searchable: true,
      gram: true,
      dedupe: true,
    },
    value: {
      type: Number,
      required: true,
      default: 0,
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
