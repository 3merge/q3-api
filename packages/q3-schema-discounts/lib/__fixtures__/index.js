const {
  RETAIL,
  MSRP,
  VOLUME,
  INCREMENTAL_MSRP,
  INCREMENTAL_RETAIL,
  CUSTOM,
} = require('../constants');

exports.taxonomy = (id) => ({
  taxonomy: id,
  kind: INCREMENTAL_MSRP,
  factor: 0.89,
});

exports.name = (name) => ({
  resource: name,
  kind: INCREMENTAL_RETAIL,
  factor: 0.89,
});

exports.cust = (name) => ({
  resource: name,
  kind: CUSTOM,
  factor: 14.99,
});

exports.expired = {
  kind: RETAIL,
  factor: 0.99,
  expiry: new Date('2010-12-12'),
};

exports.upcoming = {
  kind: VOLUME,
  factor: 0.87,
  effective: new Date('2050-12-12'),
};

exports.foo = {
  kind: MSRP,
  factor: 0.65,
  resource: 'FO*',
};

exports.glob = {
  global: true,
  factor: 0.98,
  kind: RETAIL,
};
