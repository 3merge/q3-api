const { check } = require('q3-core-composer');

module.exports.addressValidation = [
  check('documentID').isMongoId(),
  check('firstName').isString(),
  check('lastName').isString(),
  check('company').isString(),
  check('kind').isString(),
  check('streetLine1').isString(),
  check('streetLine2')
    .isString()
    .optional(),
  check('city').isString(),
  check('region').isString(),
  check('postal').isString(),
  check('country').isString(),
  check('phone1').isString(),
  check('phone2')
    .isString()
    .optional(),
  check('fax')
    .isString()
    .optional(),
  check('website')
    .isString()
    .optional(),
];
