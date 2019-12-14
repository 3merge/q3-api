const { toFactor, fromFactor } = require('../helpers');

describe('Discount helpers', () => {
  describe('toFactor', () => {
    it('should convert into factor', () =>
      expect(toFactor.call({ kind: 'MSRP' }, 12)).toBe(
        0.88,
      ));

    it('should leave alone', () =>
      expect(toFactor.call({ kind: 'Retail' }, 0.91)).toBe(
        0.91,
      ));
  });

  describe('fromFactor', () => {
    it('should convert from factor', () =>
      expect(fromFactor.call({ kind: 'MSRP' }, 0.88)).toBe(
        12,
      ));

    it('should leave alone', () =>
      expect(
        fromFactor.call({ kind: 'Retail' }, 0.91),
      ).toBe(0.91));
  });
});
