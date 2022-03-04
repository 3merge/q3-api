const mongoose = require('mongoose');
const {
  makeVirtualFilePathPlugin,
} = require('../../helpers');

const DomainSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.Mixed,
      gram: true,
      dedupe: true,
    },
    title: {
      type: String,
      gram: true,
    },
    brand: {
      type: String,
      gram: true,
    },
    supportedLngs: {
      default: ['en'],
      type: [String],
      required: true,
    },
    description: String,
    color: String,
    theme: String,
    font: String,
  },
  {
    restify: '*',
    collectionSingularName: 'domain',
    collectionPluralName: 'domains',
    enableOwnership: true,
    bypassMultitenancy: true,
  },
);

[
  'logo',
  'favicon',
  'terms',
  'privacy',
  'cancellation',
].forEach((path) => {
  makeVirtualFilePathPlugin(DomainSchema, path);
});

module.exports = DomainSchema;
