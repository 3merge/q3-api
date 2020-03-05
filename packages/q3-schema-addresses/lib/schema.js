require('q3-schema-types');
const { Schema } = require('mongoose');
const { COUNTRIES, REGIONS, KIND } = require('./constants');

module.exports = new Schema({
  primary: {
    type: Boolean,
    default: false,
  },
  firstName: {
    type: String,
    required: true,
    searchable: true,
  },
  company: {
    type: String,
    searchable: true,
  },
  lastName: {
    type: String,
    required: true,
    searchable: true,
  },
  email: Schema.Types.Email,
  branch: {
    type: Boolean,
    default: false,
  },
  streetNumber: {
    type: String,
    searchable: true,
  },
  streetLine1: {
    type: String,
    required: true,
  },
  streetLine2: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  kind: {
    type: String,
    enum: KIND,
    default: KIND[0],
  },
  region: {
    type: String,
    required: true,
    enum: REGIONS,
  },
  postal: {
    type: Schema.Types.Postal,
    required: true,
    searchable: true,
  },
  country: {
    type: String,
    enum: COUNTRIES,
    required: true,
  },
  phone1: {
    type: Schema.Types.Tel,
  },
  phone2: {
    type: Schema.Types.Tel,
  },
  fax: {
    type: Schema.Types.Tel,
  },
  url: {
    type: Schema.Types.Url,
  },
});
