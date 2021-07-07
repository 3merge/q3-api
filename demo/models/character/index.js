const Q3 = require('q3-api');
const mongoose = require('mongoose');

const Movies = new mongoose.Schema({
  title: String,
  year: Date,
});

const Character = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      max: 155,
    },
    role: {
      type: String,
      max: 155,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Neither'],
    },
    bio: {
      type: String,
    },
    company: new Q3.utils.ExtendedReference('companies')
      .on(['name'])
      .done(),
    movies: [Movies],
  },
  {
    restify: '*',
    collectionSingularName: 'character',
    collectionPluralName: 'characters',
    changelog: [
      'name',
      'role',
      'company',
      'company.name',
      'movies.$.title',
      'movies.$.year',
    ],
  },
);

Character.virtual('example').get(function callFilePath() {
  return this.getFilePath
    ? this.getFilePath('pos/example')
    : undefined;
});

module.exports = mongoose.model('characters', Character);
