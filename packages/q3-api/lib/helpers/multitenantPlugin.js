const { merge } = require('lodash');
const session = require('q3-core-session');

const multitenantPlugin = (Schema) => {
  Schema.add({
    tenant: String,
  });

  function assignTenantToQuery() {
    const tenant = session.get('TENANT');

    if (tenant)
      this.setQuery(
        merge(this.getQuery(), {
          tenant,
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
    this.tenant = session.get('TENANT');
  });
};

module.exports = multitenantPlugin;
