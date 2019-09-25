import { Schema } from 'mongoose';
import {
  validateNorthAmericanPostalCode,
  validateNorthAmericanPhoneNumber,
  validateWebsite,
} from './helpers';

const states = [
  'AL',
  'AK',
  'AS',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'DC',
  'FM',
  'FL',
  'GA',
  'GU',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MH',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'MP',
  'OH',
  'OK',
  'OR',
  'PW',
  'PA',
  'PR',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VI',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
];

const provinces = [
  'AB',
  'BC',
  'MB',
  'NB',
  'NL',
  'NT',
  'NS',
  'NU',
  'ON',
  'PE',
  'QC',
  'SK',
  'YT',
];

export default new Schema({
  company: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
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
    enum: ['Shipping', 'Billing'],
  },
  region: {
    type: String,
    required: true,
    enum: [...states, ...provinces],
    validate(v) {
      if (
        (this.country === 'Canada' && states.includes(v)) ||
        (this.country === 'United States' &&
          provinces.includes(v))
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
    enum: ['Canada', 'United States'],
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
