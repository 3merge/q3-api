jest.mock(
  'bambora-node',
  () =>
    class {
      // eslint-disable-next-line
    postPayment() {
        return { approved: 1 };
      }
    },
);

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
});
