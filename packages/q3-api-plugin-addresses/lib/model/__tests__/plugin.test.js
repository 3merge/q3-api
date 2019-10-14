const mongoose = require('mongoose');
const plugin = require('../plugin');
const stub = require('../__fixture');

const schema = new mongoose.Schema({
  po: String,
});

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
  schema.plugin(plugin);
});

describe('Address plugin', () => {
  it('should limit number of billing addresses', async (done) => {
    const Foo = mongoose.model('Foo', schema);
    const withBilling = await Foo.create({
      addresses: [stub],
      po: 123,
    });
    withBilling.addresses.push(stub);
    withBilling.save((err) => {
      expect(err).not.toBeNull();
      done();
    });
  });

  it('should allow infite shipping addresses', async () => {
    const Foo = mongoose.model('Foo', schema);
    const shippingStub = {
      ...stub,
      ...{ kind: 'Shipping' },
    };
    const { addresses } = await Foo.create({
      addresses: [
        shippingStub,
        shippingStub,
        shippingStub,
        shippingStub,
      ],
      po: 123,
    });
    expect(addresses).toHaveLength(4);
  });
});
