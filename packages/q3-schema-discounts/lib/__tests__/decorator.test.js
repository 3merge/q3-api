require('q3-schema-types');

const Decorator = require('../decorator');
const {
  CUSTOM,
  MSRP,
  VOLUME,
  INCREMENTAL_MSRP,
  INCREMENTAL_CUSTOM,
  INCREMENTAL_VOLUME,
  FIXED_PRICE,
} = require('../constants');

describe('Decorator', () => {
  describe('evaluate', () => {
    it('should return discounted custom price', () => {
      const inst = new Decorator();
      inst.kind = CUSTOM;
      inst.factor = 0.9;

      expect(inst.evaluate({ custom: 11.99 })).toBe(10.79);
    });

    it('should return discounted volume price', () => {
      const inst = new Decorator();
      inst.kind = VOLUME;
      inst.factor = 0.87;

      expect(inst.evaluate({ volume: 11.99 })).toBe(10.43);
    });

    it('should return discounted MSRP price', () => {
      const inst = new Decorator();
      inst.kind = MSRP;
      inst.factor = 0.11;
      inst.rawFactor = 0.89;

      expect(inst.evaluate({ msrp: 21.0 })).toBe(18.69);
    });

    it('should return discounted custom price as fallback', () => {
      const inst = new Decorator();
      inst.kind = MSRP;
      inst.factor = 0.11;
      inst.rawFactor = 0.89;

      expect(inst.evaluate({ custom: 21.0 })).toBe(21);
    });

    it('should return custom pricing price', () => {
      const inst = new Decorator();
      inst.kind = FIXED_PRICE;
      inst.factor = 21.99;

      expect(inst.evaluate({})).toBe(21.99);
    });

    it('should return incremented MSRP', () => {
      const inst = new Decorator();
      inst.kind = INCREMENTAL_MSRP;
      inst.rawFactor = 0.97;
      inst.incrementalHistory = { base: 19.99 };

      expect(
        inst.evaluate({
          custom: 21.99,
          msrp: 23.99,
        }),
      ).toBe(19.27);
    });

    it('should return incremented Volume', () => {
      const inst = new Decorator();
      inst.kind = INCREMENTAL_VOLUME;
      inst.rawFactor = 0.97;
      inst.incrementalHistory = { base: 19.99 };

      expect(
        inst.evaluate({
          custom: 21.99,
          volume: 23.99,
        }),
      ).toBe(19.27);
    });
  });

  describe('diff', () => {
    it('should return the difference between discount and custom', () => {
      const inst = new Decorator();
      inst.kind = INCREMENTAL_CUSTOM;
      inst.rawFactor = 0.34;
      inst.incrementalHistory = { base: 19.99 };

      expect(
        inst.diff({
          custom: 21.99,
        }),
      ).toBe(16.51);
    });
  });
});
