const { check } = require('q3-core-composer');
const {
  KIND,
  COUNTRIES,
  REGIONS,
} = require('../constants');

module.exports.validateNorthAmericanPhoneNumber = (
  v = '',
) =>
  new RegExp(
    /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
  ).test(v);

module.exports.validateNorthAmericanPostalCode = (v = '') =>
  new RegExp(
    /^[0-9]{5}$|^[A-Z][0-9][A-Z] ?[0-9][A-Z][0-9]$/,
  ).test(v.toUpperCase().replace(/\s+/g, ''));

module.exports.validateWebsite = (v = '') =>
  new RegExp(
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/,
  ).test(v);

module.exports.addressDocumentFull = [
  check('documentID')
    .isMongoId()
    .respondsWith('mongoID'),
  check('firstName')
    .isString()
    .respondsWith('required'),
  check('lastName')
    .isString()
    .respondsWith('required'),
  check('branch')
    .isBoolean()
    .respondsWith('string')
    .optional(),
  check('primary')
    .isBoolean()
    .respondsWith('boolean')
    .optional(),
  check('company')
    .isString()
    .respondsWith('required'),
  check('kind')
    .isIn(KIND)
    .respondsWith('addressType'),
  check('streetLine1')
    .isString()
    .respondsWith('required'),
  check('streetLine2')
    .isString()
    .respondsWith('string')
    .optional(),
  check('city')
    .isString()
    .respondsWith('required'),
  check('region')
    .isIn(REGIONS)
    .respondsWith('region'),
  check('postal')
    .isPostalCode('any')
    .respondsWith('postal'),
  check('country')
    .isIn(COUNTRIES)
    .respondsWith('country'),
  check('phone1')
    .isMobilePhone()
    .respondsWith('tel'),
  check('phone2')
    .isMobilePhone()
    .optional()
    .respondsWith('tel'),
  check('fax')
    .isMobilePhone()
    .respondsWith('tel')
    .optional(),
  check('website')
    .isURL()
    .respondsWith('url')
    .optional(),
];
