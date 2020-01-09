const { model } = require('mongoose');
const AddressSchema = require('..');

const Address = model('testing', AddressSchema);

const stub = {
  company: 'Hooli',
  firstName: 'Richard',
  lastName: 'Hendricks',
  streetNumber: 12,
  streetLine1: '123 Fake Street',
  city: 'Toronoto',
  country: 'CA',
  region: 'ON',
  phone1: '905-555-9231',
  postal: 'M5K 9R1',
  kind: 'Billing',
  email: 'mibberson@3merge.ca',
};

describe('Address normalization adapter', () => {
  describe('Bambora strategy', () => {
    it('should return with underscored keys', () => {
      expect(
        new Address(stub).normalize().bambora(),
      ).toMatchObject({
        name: expect.any(String),
        province: expect.any(String),
        address_line1: expect.any(String),
        postal_code: expect.any(String),
        phone_number: expect.any(String),
        email_address: expect.any(String),
        city: expect.any(String),
        country: expect.any(String),
      });
    });
  });

  describe('Purolator strategy', () => {
    it('should return uppercase keys', () => {
      expect(
        new Address(stub).normalize().purolator(),
      ).toMatchObject({
        Address: expect.objectContaining({
          Name: expect.any(String),
          StreetNumber: expect.any(String),
          StreetName: expect.any(String),
          City: expect.any(String),
          Province: expect.any(String),
          Country: expect.any(String),
          PostalCode: expect.any(String),
          PhoneNumber: {
            CountryCode: '1',
            AreaCode: '905',
            Phone: '5559231',
          },
        }),
      });
    });
  });
});
