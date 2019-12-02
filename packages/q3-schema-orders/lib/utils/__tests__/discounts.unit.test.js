const DynamicDiscountUtils = require('../discounts');
const { COMPOUND } = require('../../constants');

describe('DynamicDiscountUtils', () => {
  describe('lowest method', () => {
    it('should return the lowest output float', () => {
      const inst = new DynamicDiscountUtils({
        retail: 45.98,
      });
      const result = inst.lowest([
        { diff: jest.fn().mockReturnValue(13.27) },
        { diff: jest.fn().mockReturnValue(9.87) },
        { diff: jest.fn().mockReturnValue(19.99) },
      ]);

      expect(result).toBe(25.99);
    });

    it('should return 0 if the discount exceeds base value', () => {
      const mock = jest.fn();
      const inst = new DynamicDiscountUtils({
        retail: 11.11,
      });
      const result = inst.lowest([
        { diff: mock.mockReturnValueOnce(13.27) },
        { diff: mock.mockReturnValueOnce(9.87) },
        { diff: mock.mockReturnValueOnce(19.99) },
      ]);

      expect(result).toBe(0);
    });
  });

  describe('accumlate method', () => {
    it('should compound the discount', () => {
      const out = (i) => (v) =>
        v.discounted || v.retail * i;
      const mock = jest.fn();
      const inst = new DynamicDiscountUtils({
        retail: 45.98,
      });
      const result = inst.compound([
        { diff: mock.mockImplementationOnce(out(0.13)) },
        { diff: mock.mockImplementationOnce(out(0.08)) },
        { diff: mock.mockImplementationOnce(out(0)) },
      ]);

      expect(result).toBe(36.32);
    });
  });

  describe('together method', () => {
    it('should add the discounts together', () => {
      const mock = jest.fn();
      const inst = new DynamicDiscountUtils({
        retail: 54.1,
      });
      const result = inst.together([
        { diff: mock.mockReturnValueOnce(11) },
        { diff: mock.mockReturnValueOnce(2) },
      ]);

      expect(result).toBe(41.1);
    });
  });

  describe('get', () => {
    it('should base price with no discounts', () => {
      const inst = new DynamicDiscountUtils({ retail: 10 });
      const result = inst.get([]);
      expect(result).toBe(10);
    });

    it('should base price with unknown discount method', () => {
      const inst = new DynamicDiscountUtils(
        { retail: 10 },
        'FOOBAR',
      );
      const d = [{ diff: jest.fn() }];
      const result = inst.get(d);
      expect(result).toBe(10);
    });

    it('should route the discount according to constructor value', () => {
      const inst = new DynamicDiscountUtils(
        { retail: 10 },
        COMPOUND,
      );
      const d = [{ diff: jest.fn() }];
      inst.compound = jest.fn();
      inst.get(d);
      expect(inst.compound).toHaveBeenCalledWith(d);
    });
  });
});
