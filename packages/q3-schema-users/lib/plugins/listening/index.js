const methods = require('./methods');

module.exports = (Schema) => {
  Schema.loadClass(methods);
  return Schema;
};
