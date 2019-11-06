const Adapter = require('./adapter');
const Schema = require('./schema');

Schema.loadClass(Adapter);

module.exports = Schema;
