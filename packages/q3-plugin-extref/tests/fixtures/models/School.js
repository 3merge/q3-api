const mongoose = require('mongoose');
const {
  autopopulate,
  ExtendedReference,
} = require('../../../lib');
const helpers = require('../../helpers/models');

const School = new mongoose.Schema({
  name: String,
  location: String,
  honourRoll: [
    {
      student: {
        autopopulate: true,
        autopopulateSelect: 'name',
        type: mongoose.Schema.Types.ObjectId,
        ref: 'students',
        required: true,
      },
    },
  ],
});

ExtendedReference.plugin(School, ['students', 'teachers']);

School.plugin(autopopulate);
School.plugin(helpers);

module.exports = mongoose.model('schools', School);
