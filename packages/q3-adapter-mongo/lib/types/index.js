require('./comma');
require('./email');
require('./postal');
require('./tel');
require('./url');

const {
  Schema: { Types },
} = require('mongoose');

module.exports = Types;
