const mongoose = require('mongoose');

module.exports = mongoose.model(
  process.env.EMAIL_TEMPLATES_COLLECTION || 'emails',
  require('./schema'),
);
