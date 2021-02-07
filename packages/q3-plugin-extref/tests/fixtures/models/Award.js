const mongoose = require('mongoose');
const { ExtendedReference } = require('../../../lib');
const helpers = require('../../helpers/models');

const Award = new mongoose.Schema({
  name: String,
  reason: String,
});

ExtendedReference.plugin(Award, ['teachers']);
Award.plugin(helpers);

module.exports = mongoose.model('awards', Award);
