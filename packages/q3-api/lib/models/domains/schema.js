const mongoose = require('mongoose');
const {
  makeVirtualFilePathPlugin,
} = require('../../helpers');

const DomainSchema = new mongoose.Schema(
  {
    resources: mongoose.Schema.Types.Mixed,
    tenant: mongoose.Schema.Types.Mixed,
    lng: {
      type: String,
      required: true,
      default: 'en',
    },
    title: String,
    brand: String,
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
