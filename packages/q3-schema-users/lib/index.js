require('./middleware');
require('./plugins');

const methods = require('./methods');
const Schema = require('./schema');

Schema.loadClass(methods);

module.exports = Schema;
