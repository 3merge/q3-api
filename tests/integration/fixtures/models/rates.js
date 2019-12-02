const { setModel } = require('q3-api');
const RateSchema = require('q3-schema-rates');

RateSchema.set('restify', '*');
RateSchema.set('collectionSingularName', 'rate');
RateSchema.set('collectionSingularName', 'rates');

module.exports = setModel('rates', RateSchema);
