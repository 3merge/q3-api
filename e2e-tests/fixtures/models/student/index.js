const Q3 = require('q3-api');
const mongoose = require('mongoose');
const { assignSocialStatus } = require('./middleware');

const StudentSchema = new mongoose.Schema(
  {
    name: String,
    socialStatus: String,
    trigger: Boolean,
    friends: [
      {
        name: String,
        age: Number,
      },
    ],
  },
  {
    restify: '*',
    collectionPluralName: 'students',
    collectionSingularName: 'student',
  },
);

StudentSchema.pre('save', assignSocialStatus);
module.exports = Q3.setModel('students', StudentSchema);
