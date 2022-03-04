const Q3 = require('q3-api');
const mongoose = require('mongoose');
const { assignSocialStatus } = require('./middleware');

const SampleSchema = new mongoose.Schema(
  {
    test: String,
    message: String,
  },
  {
    testing: 1,
  },
);

const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      gram: true,
    },
    grade: Number,
    age: Number,
    class: String,
    socialStatus: String,
    trigger: Boolean,
    date: Date,
    friends: [
      {
        name: String,
        age: Number,
      },
    ],
    referenceId: mongoose.Types.ObjectId,
    samples: [SampleSchema],
    dimensions: new mongoose.Schema({
      weight: Number,
      height: Number,
    }),
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
