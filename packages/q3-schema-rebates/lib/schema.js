require('q3-schema-types');
const { Schema } = require('mongoose');
const {
  withNorthAmericanCurrency,
  withDateRange,
} = require('q3-schema-utils');
const { conditionalSkuThreshold } = require('./validation');

const RebateTierSchema = new Schema({
  quantity: Number,
  value: Number,
});

const RebatesSchema = new Schema({
  name: {
    type: String,
    required: true,
    searchable: true,
    gram: true,
  },
  description: {
    type: String,
    required: true,
    searchable: true,
    gram: true,
  },
  couponCode: {
    type: String,
    dedupe: true,
    searchable: true,
    gram: true,
  },
  value: {
    type: Number,
    min: [0, 'Cannot be negative'],
  },
  maximumPerOrder: Number,
  maximumPerProduct: Number,
  maximumPerHistory: Number,
  requiredSkus: {
    type: Schema.Types.CommaDelimited,
  },
  conditionalSkus: Schema.Types.CommaDelimited,
  conditionalSkuThreshold: {
    validate: conditionalSkuThreshold,
    type: Number,
  },
  tiers: [RebateTierSchema],
  symbol: {
    type: String,
    default: '$',
    enum: ['$', '%', '='],
    required: true,
  },
});

RebatesSchema.plugin(withDateRange);
RebatesSchema.plugin(withNorthAmericanCurrency);

module.exports = RebatesSchema;
