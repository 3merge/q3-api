const { Schema, SchemaTypes } = require('mongoose');
const { plugin } = require('q3-api-plugin-addresses');

const Company = new Schema(
  {
    name: {
      type: String,
      required: true,
      searchable: true,
    },
    email: {
      type: SchemaTypes.Email,
      required: true,
    },
    tel: {
      type: SchemaTypes.Phone,
      required: true,
      defaultRegion: 'CA',
    },
    url: {
      type: SchemaTypes.Url,
      required: true,
    },
    incorporationDate: {
      type: Date,
      required: true,
    },
    frozen: {
      type: Boolean,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    unknown: {
      type: Schema.Types.Mixed,
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
