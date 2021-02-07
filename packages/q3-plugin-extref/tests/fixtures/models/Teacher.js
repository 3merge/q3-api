const mongoose = require('mongoose');
const { ExtendedReference } = require('../../../lib');
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
        .done(),
      reason: String,
      presentedBy: new ExtendedReference('teachers')
        .on(['name'])
        .done(),
    },
  ],
  references: [
    new ExtendedReference('students')
      .on(['name', 'grade'])
      .done(),
  ],
});

const Teacher = new mongoose.Schema({
  name: String,
  school: new ExtendedReference('schools')
    .on(['name'])
    .done(),
  employment: [EmploymentHistory],
});

ExtendedReference.plugin(Teacher, ['schools', 'students']);
Teacher.plugin(helpers);

module.exports = mongoose.model('teachers', Teacher);
