const mongoose = require('mongoose');
const CompanySchema = require('./schema');

module.exports = mongoose.model('companies', CompanySchema);
