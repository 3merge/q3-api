const mongoose = require('mongoose');
const { ExtendedReference } = require('../../../lib');
const helpers = require('../../helpers/models');

const School = new mongoose.Schema({
  name: String,
  location: String,
});

ExtendedReference.plugin(School, ['students', 'teachers']);
School.plugin(helpers);

module.exports = mongoose.model('schools', School);
