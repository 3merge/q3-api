const { Schema } = require('mongoose');
const { plugin } = require('q3-api-plugin-addresses');

const Company = new Schema(
  {
    name: {
      type: String,
      required: true,
      searchable: true,
    },
    incorporationDate: {
      type: Date,
      required: true,
    },
  },
  {
    restify: 'get post patch delete',
    collectionPluralName: 'companies',
    collectionSingularName: 'company',
  },
);

Company.plugin(plugin);

module.exports = Company;
