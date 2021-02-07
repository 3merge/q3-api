const mongoose = require('mongoose');
const { ExtendedReference } = require('../../../lib');
const School = require('./School');
const Teacher = require('./Teacher');
const helpers = require('../../helpers/models');

const BaseStudent = new mongoose.Schema({
  name: String,
  grade: String,
  school: new ExtendedReference(School).on(['name']).done(),
  teacher: new ExtendedReference(Teacher)
    .on(['name'])
    .done(),
});

const Student = BaseStudent.clone();

Student.add({
  friends: [BaseStudent],
});

ExtendedReference.plugin(Student, ['students', 'teachers']);
Student.plugin(helpers);

module.exports = mongoose.model('students', Student);
