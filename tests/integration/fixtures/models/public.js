/* eslint-disable class-methods-use-this */
const { setModel } = require('q3-api');
const { Schema } = require('mongoose');

const PublicSchema = new Schema({
  name: String,
});

PublicSchema.set('restify', '*');
PublicSchema.set('collectionPluralName', 'publics');
PublicSchema.set('collectionSingularName', 'public');

module.exports = setModel('publics', PublicSchema);
