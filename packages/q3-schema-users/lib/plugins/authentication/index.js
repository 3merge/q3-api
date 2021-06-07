const methods = require('./methods');
const virtuals = require('./virtuals');

module.exports = (Schema) => {
  Schema.loadClass(methods);
  Schema.loadClass(virtuals);
  return Schema;
};
