const Adapter = require('./adapter');
const Schema = require('./schema');
require('./middleware');

Schema.loadClass(Adapter);

module.exports = Schema;
