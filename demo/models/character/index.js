const mongoose = require('mongoose');

const Character = new mongoose.Schema(
  {
    name: {
      type: String,
      searchable: true,
      minGramSize: 2,
      maxGramSize: 4,
    },
    role: String,
    gender: String,
    bio: {
      type: String,
      searchable: true,
      minGramSize: 3,
      maxGramSize: 6,
    },
  },
  {
    restify: '*',
    collectionSingularName: 'character',
    collectionPluralName: 'characters',
  },
);

Character.virtual('example').get(function callFilePath() {
  return this.getFilePath
    ? this.getFilePath('pos/example')
    : undefined;
});

module.exports = mongoose.model('characters', Character);
