const { isApproved, verifyMerchantName } = require('..');

describe('Order payment strategy helpers', () => {
  describe('"isApproved"', () => {
    it('should return truthy', () => {
      expect(isApproved('1')).toBeTruthy();
    });

    it('should return falsuy', () => {
      expect(isApproved('0')).toBeFalsy();
      expect(isApproved(null)).toBeFalsy();
    });
  });

  describe('"verifyMerchantName"', () => {
    it('should throw on unknown merchant name', () => {
      expect(() =>
        verifyMerchantName('NOOP'),
      ).toThrowError();
    });

    it('should return merchant export fn', () => {
      expect(() => verifyMerchantName('Bambora')).toEqual(
        expect.any(Function),
      );
    });
  });
});
