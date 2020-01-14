exports.taxonomy = (id) => ({
  taxonomy: id,
  formula: 'Incremental',
  strategy: 'msrp',
  factor: 0.89,
});

exports.name = (name) => ({
  resource: name,
  formula: 'Incremental',
  factor: 0.89,
  strategy: 'msrp',
});

exports.cust = (name) => ({
  resource: name,
  formula: 'Fixed',
  factor: 14.99,
  strategy: 'custom',
});

exports.expired = {
  formula: 'Incremental',
  factor: 0.99,
  expiresOn: new Date('2010-12-12'),
};

exports.upcoming = {
  formula: 'Incremental',
  factor: 0.87,
  effectiveFrom: new Date('2050-12-12'),
};

exports.foo = {
  formula: 'Factor',
  factor: 0.65,
  resource: 'FO*',
  strategy: 'msrp',
};

exports.glob = {
  global: true,
  factor: 0.98,
  formula: 'Factor',
};
