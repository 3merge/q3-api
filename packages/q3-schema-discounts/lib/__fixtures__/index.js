const {
  CUSTOM,
  MSRP,
  VOLUME,
  INCREMENTAL_MSRP,
  INCREMENTAL_CUSTOM,
  FIXED_PRICE,
} = require('../constants');

exports.taxonomy = (id) => ({
  taxonomy: id,
  kind: INCREMENTAL_MSRP,
  factor: 0.89,
});

exports.name = (name) => ({
  resource: name,
  kind: INCREMENTAL_CUSTOM,
  factor: 0.89,
});

exports.cust = (name) => ({
  resource: name,
  kind: FIXED_PRICE,
  factor: 14.99,
});

exports.expired = {
  kind: CUSTOM,
  factor: 0.99,
  expiresOn: new Date('2010-12-12'),
};

exports.upcoming = {
  kind: VOLUME,
  factor: 0.87,
  effectiveFrom: new Date('2050-12-12'),
};

exports.foo = {
  kind: MSRP,
  factor: 0.65,
  resource: 'FO*',
};

exports.glob = {
  global: true,
  factor: 0.98,
  kind: CUSTOM,
};
