const mongoose = require('mongoose');

const DomainResourcesSchema = new mongoose.Schema(
  {
    lng: {
      type: String,
      required: true,
      dedupe: true,
    },
    resources: mongoose.Schema.Types.Mixed,
    tenant: mongoose.Schema.Types.Mixed,
  },
  {
    bypassMultitenancy: true,
  },
);

module.exports = DomainResourcesSchema;
