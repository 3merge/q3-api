import mongoose from 'mongoose';
import { plugin } from '..';

const stub = {
  company: 'Hooli',
  firstName: 'Richard',
  lastName: 'Hendricks',
  streetLine1: '123 Fake Street',
  city: 'Ajax',
  country: 'United States',
  region: 'SD',
  phone1: '(905) 555-9231',
  postal: 'M5k9R1',
  kind: 'Billing',
};

const schema = new mongoose.Schema({
  po: String,
});

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
  schema.plugin(plugin, {
    singleBilling: true,
  });
});

describe('singleBilling', () => {
  it('should restrict number of billing addresses to one', async (done) => {
    const Foo = mongoose.model('Foo', schema);
    const withBilling = await Foo.create({
      addresses: [stub],
      po: 123,
    });
    withBilling.addresses.push(stub);
    withBilling.save((err) => {
      expect(err).toBeDefined();
      done();
    });
  });
});
