const getFn = jest.fn();

const RebatedDiscountUtils = jest
  .fn()
  .mockImplementation((base, quantity) => {
    return {
      getPricingTiers: getFn.mockReturnValue([
        { value: base, amount: quantity },
      ]),
    };
  });

RebatedDiscountUtils.getFn = getFn;
module.exports = RebatedDiscountUtils;
