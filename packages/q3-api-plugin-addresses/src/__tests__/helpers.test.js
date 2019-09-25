import * as helpers from '../helpers';

const expectAllCasesToPass = (arr, cb) =>
  expect(arr.every(cb)).toBeTruthy();

const expectAllCasesToFail = (arr, cb) =>
  expect(arr.some(cb)).toBeFalsy();

describe('postal code validtion', () => {
  it('should pass', () => {
    expectAllCasesToPass(
      ['l1s9r9', 'l7r 9p0', '90210'],
      helpers.validateNorthAmericanPostalCode,
    );
  });

  it('should fail', () => {
    expectAllCasesToFail(
      ['l1s99', '19r 9p0', '0927632'],
      helpers.validateNorthAmericanPostalCode,
    );
  });
});

describe('phone number validtion', () => {
  it('should pass', () => {
    expectAllCasesToPass(
      [
        '123-903-1234',
        '+1 905 999 3211',
        '(416)888-3241',
        '111.999.7183',
        '9871234325',
      ],
      helpers.validateNorthAmericanPhoneNumber,
    );
  });

  it('should fail', () => {
    expectAllCasesToFail(
      [
        '123-903-123',
        '+1 905 3211',
        '(416)     888-3241',
        '111.999..7183',
        '982271234325',
      ],
      helpers.validateNorthAmericanPhoneNumber,
    );
  });
});

describe('website validation', () => {
  it('should pass', () => {
    expectAllCasesToPass(
      [
        'https://google.ca',
        'http://google.ca',
        'https://www.yahoo.com',
        'yahoo.com',
        'www.hooli.co.uk',
      ],
      helpers.validateWebsite,
    );
  });

  it('should fail', () => {
    expectAllCasesToFail(
      [
        'https://googlea',
        'http:/google.ca',
        'htt://www.yahoo.com',
        'yahoo.com2132.232489',
      ],
      helpers.validateWebsite,
    );
  });
});
