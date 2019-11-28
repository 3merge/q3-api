require('q3-schema-types');

const { exception } = require('q3-core-responder');
const { Schema } = require('mongoose');
const {
  INCREMENTAL_MSRP,
  INCREMENTAL_VOLUME,
  INCREMENTAL_RETAIL,
  CUSTOM,
  DISCOUNTS,
} = require('./constants');
const { toFactor, fromFactor } = require('./helpers');

const PricingSchema = new Schema(
  {
    global: {
      type: Boolean,
      default: false,
    },
    kind: {
      type: String,
      enum: DISCOUNTS,
      required: true,
    },
    factor: {
      type: Number,
      get: fromFactor,
      set: toFactor,
      default: 1,
      min: 0,
    },
    taxonomy: Schema.Types.ObjectId,
    taxonomyRef: String,
    resource: Schema.Types.CommaDelimited,
    comment: String,
    effective: Date,
    expiry: Date,
    excludeFromRebating: {
      type: Boolean,
      default: false,
    },
  },
  {
    virtuals: true,
    getters: true,
    setters: true,
  },
);

/** NEEDS TRANSLATING */
PricingSchema.virtual('scope').get(function alias() {
  if (this.global) return 'Global';
  if (this.vendor) return 'Vendor';
  if (this.sku) return 'Sku';
  return 'Unknown';
});

PricingSchema.pre('save', async function checkScope() {
  if (!this.global && !this.vendor && !this.sku)
    exception('Validation')
      .msg('scope')
      .throw();

  if (
    (this.global || this.vendor) &&
    [
      INCREMENTAL_MSRP,
      INCREMENTAL_RETAIL,
      INCREMENTAL_VOLUME,
      CUSTOM,
    ].includes(this.kind)
  )
    exception('Validation')
      .msg('scope')
      .field({ name: 'kind', msg: 'incompatible' })
      .throw();
});

module.exports = PricingSchema;