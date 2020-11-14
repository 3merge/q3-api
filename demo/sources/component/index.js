const { datasource } = require('q3-api');
const schema = require('./schema');
const inc = require('./handlers/incrementTotal');

module.exports = datasource(schema).on('save', inc);
