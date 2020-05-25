const mongoose = require('mongoose');

const Movie = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  year: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model(
  'characters',
  new mongoose.Schema(
    {
      name: {
        type: String,
        searchable: true,
      },
      role: String,
      movies: [Movie],
      gender: String,
    },
    {
      restify: '*',
      collectionSingularName: 'character',
      collectionPluralName: 'characters',
      versionHistoryWatchers: [
        'name',
        'role',
        'gender',
        'movies.*.title',
        'movies.*.year',
      ],
    },
  ),
);
