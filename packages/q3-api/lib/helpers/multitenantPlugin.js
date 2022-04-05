const {
  merge,
  size,
  isString,
  get,
  invoke,
} = require('lodash');
const mongoose = require('mongoose');
const session = require('q3-core-session');

const clean = (xs) => {
  const output = String(xs).trim();
  return ['false', 'null', 'undefined', ''].includes(output)
    ? null
    : output;
};

const getTenant = () => clean(session.get('TENANT'));

/**
 * This is required to sync all models with the Domains model.
 * It's implementation is similar to our access control.
 */
const multitenantPlugin = (Schema) => {
  // mainly just for the domains collection
  if (get(Schema.options, 'bypassMultitenancy')) return;

  Schema.add({
    tenant: mongoose.Schema.Types.Mixed,
  });

  function assignTenantToQuery() {
    const opts = this.getOptions() || {};
    const q = this.getQuery() || {};
    const s = session.get('ORIGIN');

    // prevents pre-queries from running
    if (
      isString(s) &&
      size(s) &&
      !('tenant' in q) &&
      !get(opts, 'bypassMultitenancy', false)
    )
      this.setQuery(
        merge(q, {
          tenant: getTenant(),
        }),
      );
  }

  Schema.pre('find', assignTenantToQuery);
  Schema.pre('findOne', assignTenantToQuery);
  Schema.pre('findById', assignTenantToQuery);
  Schema.pre('count', assignTenantToQuery);
  Schema.pre('countDocuments', assignTenantToQuery);
  Schema.pre('estimateDocuments', assignTenantToQuery);
  Schema.pre('distinct', assignTenantToQuery);

  Schema.pre('save', function injectTenantId() {
    if (
      this.isNew &&
      !this.tenant &&
      // not a child
      (!this._id ||
        this._id.equals(get(invoke(this, 'parent'), '_id')))
    )
      this.tenant = getTenant();
  });
};

multitenantPlugin.clean = clean;

module.exports = multitenantPlugin;
