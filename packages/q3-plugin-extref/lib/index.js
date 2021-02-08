const autopopulate = require('./documentLookup');
const cleanAutopopulateRefs = require('./cleanAutopopulateRefs');
const ExtendedReference = require('./extendedReference');

module.exports = {
  ExtendedReference,
  autopopulate,
  cleanAutopopulateRefs,
};
