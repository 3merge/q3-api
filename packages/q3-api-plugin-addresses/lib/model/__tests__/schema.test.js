const { model } = require('mongoose');
const Schema = require('../schema');

describe('Address schema', () => {
  let Address;

  beforeAll(() => {
    Address = model('mock-address', Schema);
  });

  it('should fail validation without locale enums', () => {
    const { errors } = new Address({
      country: 'Brazil',
      region: 'ASK',
    }).validateSync();
    expect(errors).toHaveProperty('country');
    expect(errors).toHaveProperty('region');
  });

  it('should fail validation if state matched in Canada', () => {
    const { errors } = new Address({
      country: 'Canada',
      region: 'ID',
    }).validateSync();
    expect(errors).toHaveProperty('region');
  });

  it('should fail validation without required fields', () => {
    const { errors } = new Address({}).validateSync();
    expect(Object.keys(errors)).toEqual(
      expect.arrayContaining([
        'company',
        'firstName',
        'lastName',
        'streetLine1',
        'city',
        'region',
        'postal',
        'country',
        'phone1',
        'kind',
      ]),
    );
  });

  it('should pass validation', () => {
    const response = new Address({
      company: 'Hooli',
      firstName: 'Richard',
      lastName: 'Hendricks',
      streetLine1: '123 Fake Street',
      city: 'Toronoto',
      country: 'Canada',
      region: 'ON',
      phone1: '905-555-9231',
      postal: 'M5K 9R1',
      kind: 'Shipping',
    }).validateSync();
    expect(response).toBeUndefined();
  });
});
