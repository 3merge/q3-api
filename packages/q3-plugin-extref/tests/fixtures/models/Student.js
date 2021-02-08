const mongoose = require('mongoose');
const {
  autopopulate,
  cleanAutopopulateRefs,
  ExtendedReference,
} = require('../../../lib');
const School = require('./School');
const helpers = require('../../helpers/models');

const BaseStudent = new mongoose.Schema({
  name: String,
  grade: String,
  school: new ExtendedReference(School).on(['name']).done(),
  teacher: {
    autopopulate: true,
    autopopulateSelect: 'name',
    type: mongoose.Schema.Types.ObjectId,
    ref: 'teachers',
  },
});

const Student = BaseStudent.clone();

Student.add({
  friends: [BaseStudent],
});

ExtendedReference.plugin(Student, ['students', 'teachers']);
Student.plugin(helpers);
Student.plugin(autopopulate);
Student.plugin(cleanAutopopulateRefs, ['schools']);

module.exports = mongoose.model('students', Student);
