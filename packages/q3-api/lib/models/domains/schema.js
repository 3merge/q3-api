const mongoose = require('mongoose');
const {
  makeVirtualFilePathPlugin,
} = require('../../helpers');

const DomainSchema = new mongoose.Schema(
  {
    resources: mongoose.Schema.Types.Mixed,
    tenant: {
      type: mongoose.Schema.Types.Mixed,
      gram: true,
      dedupe: true,
    },
    lng: {
      type: String,
      required: true,
      default: 'en',
    },
    title: {
      type: String,
      gram: true,
    },
    brand: {
      type: String,
      gram: true,
    },
    supportedLngs: [String],
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
