const getFn = jest.fn();

const DynamicDiscountUtils = jest
  .fn()
  .mockImplementation((base) => {
    return {
      get: getFn.mockReturnValue(base),
    };
  });

DynamicDiscountUtils.getFn = getFn;
module.exports = DynamicDiscountUtils;
