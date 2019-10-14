const { Schema } = require('mongoose');
const {
  validateNorthAmericanPostalCode,
  validateNorthAmericanPhoneNumber,
  validateWebsite,
} = require('../validations');
const {
  PROVINCES,
  STATES,
  COUNTRIES,
  REGIONS,
  KIND,
} = require('../constants');

module.exports = new Schema({
  primary: {
    type: Boolean,
  },
  company: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  branch: {
    type: Boolean,
  },
  lastName: {
    type: String,
    required: true,
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
    required: true,
    enum: KIND,
  },
  region: {
    type: String,
    required: true,
    enum: REGIONS,
    validate(v) {
      if (
        (this.country === 'Canada' && STATES.includes(v)) ||
        (this.country === 'United States' &&
          PROVINCES.includes(v))
      ) {
        return false;
      }
      return true;
    },
  },
  postal: {
    type: String,
    required: true,
    validate: validateNorthAmericanPostalCode,
  },
  country: {
    type: String,
    enum: COUNTRIES,
    required: true,
  },
  phone1: {
    type: String,
    required: true,
    validate: validateNorthAmericanPhoneNumber,
  },
  phone2: {
    type: String,
    validate: validateNorthAmericanPhoneNumber,
  },
  fax: {
    type: String,
    validate: validateNorthAmericanPhoneNumber,
  },
  url: {
    type: String,
    validate: validateWebsite,
  },
});
