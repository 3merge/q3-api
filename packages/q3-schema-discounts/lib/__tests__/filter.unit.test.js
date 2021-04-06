require('q3-schema-types');

const mongoose = require('mongoose');
const DiscountFilter = require('../filter');
const DiscountSchema = require('..');
const { foo } = require('../__fixtures__');

let Model;

const wrapConstructor = (discounts = []) => {
  const m = new Model({ discounts });
  return new DiscountFilter(m.discounts);
};

beforeAll(async () => {
  DiscountSchema.set('target', 'custom');
  Model = mongoose.model(
    'DISCOUNTING',
    new mongoose.Schema({
      discounts: [DiscountSchema],
    }),
  );

  await mongoose.connect(process.env.CONNECTION);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('DiscountFilter', () => {
  describe('getBaseDiscount', () => {
    it('should return best value discount', () => {
      const resource = 'QUUZ';
      const tax = mongoose.Types.ObjectId();
      const inst = wrapConstructor([
        {
          formula: 'Factor',
          strategy: 'custom',
          factor: 0.98,
          global: true,
        },
        {
          formula: 'Factor',
          strategy: 'custom',
          factor: 0.93,
          resource,
        },
        {
          formula: 'Factor',
          strategy: 'custom',
          factor: 0.91,
          taxonomy: tax,
        },
        {
          formula: 'Factor',
          strategy: 'custom',
          factor: 0.92,
          resource,
        },
      ]);
      const result = inst.getBaseDiscount(resource, tax, {
        custom: 4.99,
      });

      expect(result).toHaveProperty('factor', 0.91);
    });

    it('should return best value taxonomy', () => {
      const resource = 'QUUZ';
      const tax = mongoose.Types.ObjectId();
      const inst = wrapConstructor([
        {
          formula: 'Factor',
          strategy: 'custom',
          factor: 0.98,
          global: true,
        },
        {
          formula: 'Factor',
          strategy: 'custom',
          factor: 0.93,
          resource: 'NOOP',
        },
        {
          formula: 'Factor',
          strategy: 'custom',
          factor: 0.91,
          taxonomy: tax,
        },
        {
          formula: 'Factor',
          strategy: 'custom',
          factor: 0.92,
          resource: 'HEY',
        },
      ]);

      const result = inst.getBaseDiscount(resource, tax, {
        custom: 4.99,
      });

      expect(result).toHaveProperty('factor', 0.91);
    });
  });

  describe('getAugmentedDiscount', () => {
    it('should return fixed-price discount', () => {
      const resource = 'QUUZ';
      const inst = wrapConstructor([
        {
          formula: 'Incremental',
          factor: 13,
          resource,
          strategy: 'msrp',
        },
        { formula: 'Fixed', factor: 3.5, resource },
      ]);

      const result = inst.getAugmentedDiscount(resource, {
        custom: 4.99,
        discounted: 3.0,
        msrp: 5.99,
      });

      expect(result).toHaveProperty('factor', 3.5);
    });
  });

  describe('getBlendedDiscount', () => {
    it('should assign a discount value', () => {
      const resource = 'ADD';
      const pricing = {
        custom: 4.99,
        msrp: 5.99,
        volume: 4.49,
      };

      const inst = wrapConstructor([
        {
          formula: 'Factor',
          strategy: 'volume',
          factor: 0.87,
          resource,
        },
        {
          formula: 'Incremental',
          strategy: 'msrp',
          factor: 0.21,
          resource,
        },
        {
          formula: 'Factor',
          strategy: 'custom',
          factor: 0.99,
          resource: [''],
        },
        {
          formula: 'Factor',
          factor: 0.99,
          strategy: 'Custom',
          taxonomy: {
            id: mongoose.Types.ObjectId(),
          },
        },
      ]);

      const result = inst.getBlendedDiscount(
        resource,
        mongoose.Types.ObjectId(),
        pricing,
      );

      expect(pricing).toHaveProperty('discounted', 3.9063);
      expect(result).toHaveProperty('factor', 0.21);
    });

    it('should save discount object to schema', () => {
      const resource = 'VERBOSE';
      const pricing = {
        custom: 10,
        msrp: 12,
      };

      const inst = wrapConstructor([
        {
          formula: 'Factor',
          strategy: 'custom',
          factor: 0.9,
          resource,
        },
        {
          formula: 'Incremental',
          strategy: 'msrp',
          factor: 0.21,
          resource,
        },
      ]);

      const result = inst.getBlendedDiscount(
        resource,
        null,
        pricing,
        true,
      );

      expect(result).toHaveProperty('base', 9);
      expect(result).toHaveProperty(
        'trail',
        expect.any(Array),
      );
    });

    it('should assign a discount value a falsy value', () => {
      const resource = 'ADD';
      const pricing = {
        custom: 4.99,
        msrp: 5.99,
        volume: 4.49,
      };

      const inst = wrapConstructor([
        {
          strategy: 'volume',
          factor: 0.87,
          resource: 'NOOP',
          formula: 'Factor',
        },
        {
          formula: 'Incremental',
          strategy: 'msrp',
          factor: 25,
          resource,
        },
      ]);

      const result = inst.getBlendedDiscount(
        resource,
        mongoose.Types.ObjectId(),
        pricing,
      );

      expect(pricing).toHaveProperty('discounted', null);
      expect(result).toHaveProperty('factor', 25);
    });

    it('should ignore augmented discounts', () => {
      const tax = mongoose.Types.ObjectId();
      const pricing = {
        custom: 4.99,
        msrp: 5.99,
        volume: 4.49,
      };

      const inst = wrapConstructor([
        foo,
        {
          strategy: 'volume',
          formula: 'Factor',
          factor: 0.91,
          taxonomy: tax,
        },
      ]);

      const result = inst.getBlendedDiscount(
        'BAR',
        tax,
        pricing,
      );

      expect(pricing).toHaveProperty('discounted', 4.0859);
      expect(result).toHaveProperty('factor', 0.91);
    });
  });
});
