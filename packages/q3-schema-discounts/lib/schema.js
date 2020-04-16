require('q3-schema-types');
const { withDateRange } = require('q3-schema-utils');
const { exception } = require('q3-core-responder');
const { Schema } = require('mongoose');

const PricingSchema = new Schema(
  {
    global: {
      type: Boolean,
    },
    formula: {
      type: String,
      enum: [
        'Compound',
        'Factor',
        'Percent',
        'Fixed',
        'Incremental',
      ],
      default: 'Factor',
    },
    strategy: {
      type: String,
    },
    factor: {
      type: Number,
      default: 1,
      set(v) {
        if (this.formula === 'Fixed') return v;
        this.percentage = 100 - v * 100;
        return v;
      },
    },
    base: Number,
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

PricingSchema.virtual('trail');

PricingSchema.virtual('scope').get(function alias() {
  if (this.global) return 'Global';
  if (this.taxonomy) return 'Taxonomy';
  if (this.resource) return 'Resource';
  return 'Unknown';
});

PricingSchema.pre(
  'validate',
  function checkForEmptyResources() {
    if (
      (!this.taxonomy &&
        Array.isArray(this.resource) &&
        !this.resource.filter(Boolean).length) ||
      this.resource === ''
    ) {
      this.global = true;
      this.resource = null;
    }
  },
);

PricingSchema.pre('save', async function checkScope() {
  if (!this.global && !this.taxonomy && !this.resource)
    exception('Validation').msg('scope').throw();
});

PricingSchema.plugin(withDateRange);
module.exports = PricingSchema;
