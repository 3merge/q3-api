const plugin = require('q3-schema-utils/plugins/common');
const Decorator = require('./decorators');
const Schema = require('./schema');

Schema.loadClass(Decorator);
Schema.pre('save', Decorator.isValid);
Schema.plugin(plugin);

module.exports = Schema;
