const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      gram: true,
    },
    description: {
      type: String,
      required: true,
      gram: true,
    },
    contact: {
      type: String,
      required: true,
      gram: true,
    },
    email: {
      type: String,
      required: true,
      gram: true,
    },
    tel: {
      type: String,
      required: true,
      gram: true,
    },
    ip: String,
    incorporationDate: Date,
  },
  {
    restify: '*',
    collectionSingularName: 'company',
    collectionPluralName: 'companies',
    extends: ['characters'],
  },
);

module.exports = CompanySchema;
