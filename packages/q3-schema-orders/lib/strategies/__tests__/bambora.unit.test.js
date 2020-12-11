jest.mock('bambora-node', () => {
  const fn = jest.fn();

  class Bn {
    // eslint-disable-next-line
    postPayment(...args) {
      fn(...args);
      return { approved: 1 };
    }
  }

  Bn.mock = fn;
  return Bn;
});

const bn = require('bambora-node');
const Bambora = require('../bambora');

const getShippingStub = () => ({
  normalize: jest.fn().mockReturnValue({
    bambora: jest.fn(),
  }),
});

describe('Bambora strategy', () => {
  it('should normalize order address lines and submit token', async () => {
    const stub = {
      shipping: getShippingStub(),
      billing: getShippingStub(),
    };

    const r = await Bambora(stub, 'token');
    expect(r).toHaveProperty('approved', 1);
    expect(stub.billing.normalize).toHaveBeenCalled();
    expect(stub.shipping.normalize).toHaveBeenCalled();
  });

  it('should include order number', async () => {
    await Bambora(
      {
        shipping: getShippingStub(),
        billing: getShippingStub(),
        // only if included...
        order_number: 1,
      },
      'token',
    );

    expect(bn.mock).toHaveBeenCalledWith(
      expect.objectContaining({
        order_number: 1,
      }),
      undefined,
    );
  });
});
