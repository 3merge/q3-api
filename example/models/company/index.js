const { Schema } = require('mongoose');
const { plugin } = require('q3-api-plugin-addresses');

const Company = new Schema({
  name: String,
  incorporationDate: Date,
});

Company.plugin(plugin);
module.exports = Company;
