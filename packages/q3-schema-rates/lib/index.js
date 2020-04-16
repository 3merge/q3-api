/* eslint-disable func-names */
const Schema = require('./schema');
const Decorator = require('./decorator');

Schema.path('value').set(function (v) {
  this.$lastValue = this.value;
  return v;
});

Schema.loadClass(Decorator);
module.exports = Schema;
