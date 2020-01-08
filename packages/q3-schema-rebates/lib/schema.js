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
  },
  description: {
    type: String,
    required: true,
  },
  couponCode: {
    type: String,
    dedupe: true,
  },
  value: {
    type: Number,
    min: [0, 'Cannot be negative'],
  },
  maximumPerOrder: Number,
  maximumPerProduct: Number,
  maximumPerHistory: Number,
  requiredSkus: Schema.Types.CommaDelimited,
  conditionalSkus: Schema.Types.CommaDelimited,
  conditionalSkuThreshold: Number,
  tiers: [RebateTierSchema],
  location: {
    type: String,
    enum: ['Product', 'Order'],
    default: 'Product',
  },
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
