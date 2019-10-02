const deco = require('./decorator');
const schema = require('./schema');

schema.loadClass(deco);

module.exports = schema;
