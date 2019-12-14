const VisitorOrderItem = require('../orderItem');
const DynamicDiscounts = require('../../utils/discounts');

jest.mock('../../utils/discounts');

describe('OrderItem visitor', () => {
  describe('instantiation', () => {
    it('should execute all methods in constructor', async () => {
      const mock = jest.fn();
      const inst = new VisitorOrderItem();

      inst.checkAvailability = mock;
      inst.checkPricing = mock;
      inst.checkDiscounts = mock;
      inst.calculate = mock;

      await inst.run();
      expect(mock).toHaveBeenCalled();
      expect(mock.mock.calls).toHaveLength(4);
    });
  });

  describe('checkAvailability method', () => {
    it('should call setItemBucket with product and quantity args', async () => {
      const inst = new VisitorOrderItem();
      const setItemBucket = jest
        .fn()
        .mockResolvedValue(true);
      inst.store = { product: 1, quantity: 2 };
      await inst.checkAvailability({
        setItemBucket,
      });

      expect(setItemBucket).toHaveBeenCalledWith(1, 2);
    });

    it('should fail if setItemBucket returns falsy', async (done) => {
      const inst = new VisitorOrderItem();
      const setItemBucket = jest
        .fn()
        .mockResolvedValue(false);

      return inst
        .checkAvailability({
          setItemBucket,
        })
        .catch((e) => {
          expect(e.name).toMatch('Validation');
          done();
        });
    });
  });

  describe('checkPricing method', () => {
    it('should call checkPricing with bucket', async () => {
      const inst = new VisitorOrderItem();
      const bucket = { foo: 'bar' };
      const setItemUnmodifiedPrice = jest
        .fn()
        .mockResolvedValue(1);

      inst.store.bucket = bucket;
      await inst.checkPricing({
        setItemUnmodifiedPrice,
      });

      expect(setItemUnmodifiedPrice).toHaveBeenCalledWith(
        bucket,
      );
    });

    it('should fail if checkPricing returns 0', async (done) => {
      const inst = new VisitorOrderItem();
      const setItemUnmodifiedPrice = jest
        .fn()
        .mockResolvedValue(-1);

      return inst
        .checkPricing({
          setItemUnmodifiedPrice,
        })
        .catch((e) => {
          expect(e.name).toMatch('Validation');
          done();
        });
    });
  });

  describe('checkDiscounts implementation', () => {
    it('should call automateItemDiscounts if set', async () => {
      const inst = new VisitorOrderItem();
      const automateItemDiscounts = jest
        .fn()
        .mockResolvedValue([{ foo: 'bar' }]);

      await inst.checkDiscounts({
        automateItemDiscounts,
      });

      expect(inst.store.discounts).toHaveLength(1);
    });
  });

  describe('getFinalPrice', () => {
    it('should override all other discounts', () => {
      const inst = new VisitorOrderItem();
      inst.store = {
        quantity: 1,
        priceOverride: {
          evaluate: jest.fn().mockReturnValue(4.99),
        },
      };

      inst.getFinalPrice();
      expect(inst.store.price).toEqual(4.99);
    });

    it('should run through discounts', () => {
      const inst = new VisitorOrderItem();
      inst.store = {
        discounts: [],
        quantity: 12,
        unmodifiedPrice: 9,
        discountBy: 'lowest',
      };

      inst.getFinalPrice();
      expect(inst.store.price).toEqual(9);
      expect(DynamicDiscounts).toHaveBeenCalledWith(
        inst.store.unmodifiedPrice,
        inst.store.discountBy,
      );
    });

    it('should call currency converter', () => {
      const inst = new VisitorOrderItem();
      inst.store = {
        discounts: [],
        quantity: 12,
        unmodifiedPrice: 9,
        discountBy: 'lowest',
        bucket: {
          currency: 'CAD'
        }
      };

      inst.getFinalPrice({
        automateCurrencyConversion: v => v * 10
      });

      expect(inst.store.price).toEqual(90);
    });
  });

  describe('calculate', () => {
    it('should override all other discounts', () => {
      const inst = new VisitorOrderItem();
      inst.store = {
        quantity: 4,
        priceOverride: {
          evaluate: jest.fn().mockReturnValue(8.99),
        },
      };

      inst.calculate();
      expect(inst.store.subtotal).toBe(35.96);
    });
  });
});
