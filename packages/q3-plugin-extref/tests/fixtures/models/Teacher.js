const mongoose = require('mongoose');
const {
  cleanAutopopulateRefs,
  ExtendedReference,
} = require('../../../lib');
const helpers = require('../../helpers/models');

const EmploymentHistory = new mongoose.Schema({
  school: new ExtendedReference('schools')
    .on(['name'])
    .done(),
  year: Date,
  awards: [
    {
      award: new ExtendedReference('awards')
        .on(['name'])
        .isRequired()
        .done(),
      reason: String,
      presentedBy: new ExtendedReference('teachers')
        .on(['name'])
        .done(),
    },
  ],
  references: [
    {
      type: new ExtendedReference('students')
        .on(['name', 'grade'])
        .done(),
      sync: true,
    },
  ],
});

const Teacher = new mongoose.Schema({
  name: String,
  school: new ExtendedReference('schools')
    .on(['name'])
    .done(),
  employment: [EmploymentHistory],
});

// SHOULD NOT APPEAR
Teacher.virtual('testing').get(() => 'TESTING');

ExtendedReference.plugin(Teacher, ['schools', 'students']);
Teacher.plugin(cleanAutopopulateRefs, ['students']);
Teacher.plugin(helpers);

module.exports = mongoose.model('teachers', Teacher);
