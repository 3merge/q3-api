const mongoose = require('mongoose');

const Character = new mongoose.Schema(
  {
    name: {
      type: String,
      searchable: true,
    },
    role: String,
    gender: String,
  },
  {
    restify: '*',
    collectionSingularName: 'character',
    collectionPluralName: 'characters',
    quicksearch: 'name',
  },
);

Character.virtual('example').get(function callFilePath() {
  return this.getFilePath
    ? this.getFilePath('pos/example')
    : undefined;
});

module.exports = mongoose.model('characters', Character);
