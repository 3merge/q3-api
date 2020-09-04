const Q3 = require('q3-api');
const mongoose = require('mongoose');
const { assignSocialStatus } = require('./middleware');

const SampleSchema = new mongoose.Schema({
  test: String,
});

const StudentSchema = new mongoose.Schema(
  {
    name: String,
    age: Number,
    socialStatus: String,
    trigger: Boolean,
    friends: [
      {
        name: String,
        age: Number,
      },
    ],
    samples: [SampleSchema],
  },
  {
    restify: '*',
    collectionPluralName: 'students',
    collectionSingularName: 'student',
    versionHistoryWatchers: [
      'age',
      'friends.*.name',
      'friends.*.age',
      'class',
    ],
  },
);

StudentSchema.pre('save', assignSocialStatus);
module.exports = Q3.setModel('students', StudentSchema);
