require('q3-schema-types');

const { withDateRange } = require('q3-schema-utils');
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
      min: 0,
    },
    taxonomy: Schema.Types.ObjectId,
    taxonomyRef: String,
    resource: Schema.Types.CommaDelimited,
    comment: String,
    incrementalHistory: {
      base: Number,
      bucket: Schema.Types.Mixed,
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
  if (this.taxonomy) return 'Taxonomy';
  if (this.resource) return 'Resource';
  return 'Unknown';
});

PricingSchema.pre('save', async function checkScope() {
  if (!this.global && !this.taxonomy && !this.resource)
    exception('Validation')
      .msg('scope')
      .throw();

  if (
    (this.global || this.taxonomy) &&
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

PricingSchema.plugin(withDateRange);
module.exports = PricingSchema;
