const validations = require('.');

const runValidator = (method) => (v, expected) => {
  test(`should ${
    expected ? 'pass' : 'fail'
  } validation`, () => {
    const cond = expect(validations[method](v));
    if (expected) cond.toBeTruthy();
    else cond.toBeFalsy();
  });
};

describe.each([
  ['l1s9r9', true],
  ['l7r 9p0', true],
  ['90210', true],
  ['l1s99', false],
  ['19r 9p0', false],
  ['0927632', false],
])(
  'Postal code: "%s"',
  runValidator('validateNorthAmericanPostalCode'),
);

describe.each([
  ['123-903-1234', true],
  ['+1 905 999 3211', true],
  ['(416)888-3241', true],
  ['111.999.7183', true],
  ['9871234325', true],
  ['123-903-123', false],
  ['+1 905 3211', false],
  ['(416)     888-3241', false],
  ['111.999..7183', false],
  ['982271234325', false],
])(
  'Phone Number: "%s"',
  runValidator('validateNorthAmericanPhoneNumber'),
);

describe.each([
  ['https://google.ca', true],
  ['http://google.ca', true],
  ['https://www.yahoo.com', true],
  ['yahoo.com', true],
  ['www.hooli.co.uk', true],
  ['https://googlea', false],
  ['http:/google.ca', false],
  ['htt://www.yahoo.com', false],
  ['yahoo.com2132.232489', false],
])('Website: "%s"', runValidator('validateWebsite'));
