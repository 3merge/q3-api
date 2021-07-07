const Q3 = require('q3-api');
const mongoose = require('mongoose');
const { assignSocialStatus } = require('./middleware');

const SampleSchema = new mongoose.Schema({
  test: String,
});

const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      gram: true,
    },
    grade: Number,
    age: Number,
    socialStatus: String,
    trigger: Boolean,
    date: Date,
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
    changelog: [
      'friends.$.name',
      'friends.$.age',
      'class',
      'name',
    ],
    createdByAutocompleteProjection: ['role'],
  },
);

StudentSchema.pre('save', assignSocialStatus);
module.exports = Q3.setModel('students', StudentSchema);
