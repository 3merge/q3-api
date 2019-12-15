/* eslint-disable class-methods-use-this */
const { setModel } = require('q3-api');
const OrderSchema = require('q3-schema-orders');

OrderSchema.set('restify', '*');
OrderSchema.set('collectionPluralName', 'orders');
OrderSchema.set('collectionSingularName', 'order');

module.exports = setModel('orders', OrderSchema);
