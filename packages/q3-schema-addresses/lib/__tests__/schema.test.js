const { Schema, model, connect } = require('mongoose');
const AddressSchema = require('..');

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
};

const EmbeddedSchema = new Schema({
  addresses: [AddressSchema],
});

EmbeddedSchema.pre(
  'save',
  AddressSchema.ensureSingleBilling,
);

describe('Address schema', () => {
  let Address;
  let Embed;

  beforeAll(async () => {
    Address = model('mock-address', AddressSchema);
    Embed = model('mock-address-embed', EmbeddedSchema);

    await connect(process.env.CONNECTION);
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
      country: 'CA',
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
        'streetNumber',
        'streetLine1',
        'city',
        'region',
        'postal',
        'country',
        'phone1',
      ]),
    );
  });

  it('should pass validation', () => {
    const response = new Address(stub).validateSync();
    expect(response).toBeUndefined();
  });

  it('should restrict number of billing addresses', async () => {
    const doc = await Embed.create({
      addresses: [stub],
    });
    doc.addresses.push(stub);
    return expect(doc.save()).rejects.toThrowError();
  });
});
