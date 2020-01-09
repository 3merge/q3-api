const moment = require('moment');
const Utils = require('.');

describe('Mongoose plugin schemas', () => {
  describe('withDateRange', () => {
    it('should append date fields', () => {
      const add = jest.fn();
      const methods = {};
      const statics = {};
      Utils.withDateRange({ add, methods, statics });
      expect(add).toHaveBeenCalledWith({
        effectiveFrom: Date,
        expiresOn: Date,
      });
    });

    it('should detect upcoming documents', () => {
      const add = jest.fn();
      const methods = {};
      const statics = {};
      Utils.withDateRange({ add, methods, statics });
      expect(
        methods.hasNotYetBegun.call({
          effectiveFrom: moment().add(2, 'days'),
        }),
      ).toBeTruthy();
      expect(
        methods.hasNotYetBegun.call({
          effectiveFrom: moment(),
        }),
      ).toBeFalsy();
      expect(
        methods.hasExpired.call({
          expiresOn: moment().subtract(2, 'weeks'),
        }),
      ).toBeTruthy();
      expect(
        methods.hasExpired.call({
          expiresOn: moment().add(2, 'weeks'),
        }),
      ).toBeFalsy();
    });

    it('should detect expired documents', () => {
      const add = jest.fn();
      const methods = {};
      const statics = {};
      Utils.withDateRange({ add, methods, statics });
      expect(
        methods.hasExpired.call({
          expiresOn: moment().subtract(2, 'days'),
        }),
      ).toBeTruthy();
      expect(
        methods.hasExpired.call({
          expiresOn: moment().add(2, 'weeks'),
        }),
      ).toBeFalsy();
    });
  });

  describe('withNorthAmericanCurrency', () => {
    it('should append currency field with converter', () => {
      const add = jest.fn();
      const methods = {};
      Utils.withNorthAmericanCurrency({ add, methods });
      expect(add).toHaveBeenCalledWith({
        currency: expect.any(Object),
      });
      expect(methods).toHaveProperty('convert');
      expect(methods.convert(100, 'USD', 'CAD', 1.33)).toBe(
        133,
      );
      expect(
        methods.convert(100, 'CAD', 'USD', 1.33),
      ).toBeCloseTo(75.18, 0.5);
    });
  });
});

test('multiply', () => {
  expect(Utils.multiply(2, 5)).toBe(10);
});

test('increment', () => {
  expect(Utils.increment(0.8, 25, 10)).toBe(5);
});

describe('asNum', () => {
  it('should default to 0', () => {
    expect(Utils.asNum(null)).toBe(0);
  });

  it('should pass through numbers', () => {
    expect(Utils.asNum(3)).toBe(3);
  });
});

describe('filters', () => {
  describe('byObjectId', () => {
    const stub = Utils.filters.byObjectId(123, '_id');
    it('should return falsy', () => {
      expect(stub({ noop: true })).toBeFalsy();
    });

    it('should return truthy', () => {
      expect(
        stub({
          _id: { equals: jest.fn().mockReturnValue(true) },
        }),
      ).toBeTruthy();
    });

    it('should filter the array', () => {
      const equals = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const items = [
        { _id: { equals } },
        { _id: { equals } },
      ];
      expect(items.filter(stub)).toHaveLength(1);
    });
  });

  describe('filterByName', () => {
    const stub = Utils.filters.filterByName('foo');
    it('should return falsy', () => {
      expect(stub({ resource: 'bar' })).toBeFalsy();
    });

    it('should return truthty', () => {
      expect(stub({ resource: 'fo*' })).toBeTruthy();
    });

    it('should filter an array', () => {
      const items = [
        { resource: 'fo*' },
        { resource: 'qu*' },
        {},
      ];
      expect(items.filter(stub)).toHaveLength(1);
    });
  });
});
