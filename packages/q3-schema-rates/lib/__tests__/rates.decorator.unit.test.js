const Decorator = require('../decorator');

const execMeetsThreshold = (op, value) => {
  const deco = new Decorator();
  deco.threshold = `${op}10`;
  return deco.meetsThreshold(value);
};

const genThreshold = (value) => ({
  meetsThreshold: jest.fn().mockReturnValue(true),
  value,
});

describe('Rates decorator', () => {
  describe('"meetsThreshold"', () => {
    it('should match strict equals', () => {
      expect(execMeetsThreshold('==', 10)).toBeTruthy();
      expect(execMeetsThreshold('==', 9)).toBeFalsy();
    });

    it('should match greater than', () => {
      expect(execMeetsThreshold('>', 11)).toBeTruthy();
      expect(execMeetsThreshold('>', 9)).toBeFalsy();
    });

    it('should match greater than', () => {
      expect(execMeetsThreshold('<', 9)).toBeTruthy();
      expect(execMeetsThreshold('<', 11)).toBeFalsy();
    });

    it('should match greater than or equal to', () => {
      expect(execMeetsThreshold('>=', 11)).toBeTruthy();
      expect(execMeetsThreshold('>=', 10)).toBeTruthy();
      expect(execMeetsThreshold('>=', 9)).toBeFalsy();
    });

    it('should match less than or equal to', () => {
      expect(execMeetsThreshold('<=', 9)).toBeTruthy();
      expect(execMeetsThreshold('<=', 10)).toBeTruthy();
      expect(execMeetsThreshold('<=', 11)).toBeFalsy();
    });
  });

  describe('"findAndReduceByThresholdAsc"', () => {
    beforeAll(() => {
      Decorator.find = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([
            genThreshold(100),
            genThreshold(50),
          ]),
      });
    });

    it('should return threshold in custom order', async () => {
      const high = await Decorator.findAndReduceByThresholdAsc();
      const low = await Decorator.findAndReduceByThresholdDesc();
      expect(high).toBe(50);
      expect(low).toBe(100);
    });
  });
});
