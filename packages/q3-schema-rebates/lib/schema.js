require('q3-schema-types');
const { Schema } = require('mongoose');
const {
  withNorthAmericanCurrency,
  withDateRange,
} = require('q3-schema-utils');

const RebateTierSchema = new Schema({
  quantity: Number,
  value: Number,
});

const RebatesSchema = new Schema({
  name: {
    type: String,
    required: true,
    searchable: true,
  },
  description: {
    type: String,
    required: true,
    searchable: true,
  },
  couponCode: {
    type: String,
    dedupe: true,
    searchable: true,
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
    searchable: true,
  },
  conditionalSkus: Schema.Types.CommaDelimited,
  conditionalSkuThreshold: Number,
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
