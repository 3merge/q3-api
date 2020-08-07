const { getRemainder } = require('../helpers');

describe('Rebate helpers', () => {
  describe('"geRemainder"', () => {
    it('should ignore null values', () =>
      expect(getRemainder(null, null, 10)).toBe(10));

    it('should return parameter 1 if smaller than 2 & 3', () =>
      expect(getRemainder(7, 30, 10)).toBe(7));

    it('should return parameter 2 if smaller than 1 & 3', () =>
      expect(getRemainder(7, 3, 10)).toBe(3));

    it('should return parameter 3 when less than both 1 & 2', () =>
      expect(getRemainder(71, 30, 10)).toBe(10));

    it('should return parameter 3 when less than 1 and 2 is undefined', () =>
      expect(getRemainder(71, undefined, 50)).toBe(50));

    it('should return 0 when parameter 3 is not defined', () =>
      expect(getRemainder(1, 91)).toBe(0));

    it('should return 2 when parameter 1 is not defined and lower than 3', () =>
      expect(getRemainder('', 1, 91)).toBe(1));
  });
});
