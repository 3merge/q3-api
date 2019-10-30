const { Schema, SchemaTypes } = require('mongoose');
const { plugin } = require('q3-api-plugin-addresses');

const SubDocumentArray = new Schema({
  name: {
    type: String,
    searchable: true,
  },
  reference: {
    type: Schema.Types.ObjectId,
    ref: 'q3-api-users',
  },
});

const Company = new Schema(
  {
    name: {
      type: String,
      required: true,
      searchable: true,
    },
    email: {
      type: SchemaTypes.Email,
      searchable: true,
      required: true,
    },
    tel: {
      type: SchemaTypes.Phone,
      required: true,
      defaultRegion: 'CA',
      searchable: true,
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
    subbies: [SubDocumentArray],
  },
  {
    // rest options
    restify: 'get post patch delete',
    collectionPluralName: 'companies',
    collectionSingularName: 'company',
    notes: true,
    uploads: true,
    version: true,

    // three event-driven options
    onPopulate: {
      'subbies.reference': 'firstName email id',
      'thread.createdBy': 'firstName featuredUpload photo',
    },
  },
);

Company.plugin(plugin);

// indexing
Company.index(
  {
    name: 'text',
    email: 'text',
    url: 'text',
    tel: 'text',
  },
  { name: '$search' },
);

module.exports = Company;
