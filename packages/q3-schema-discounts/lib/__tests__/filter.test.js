require('q3-schema-types');

const mongoose = require('mongoose');
const DiscountFilter = require('../filter');
const DiscountSchema = require('..');
const {
  expired,
  foo,
  upcoming,
  glob,
  taxonomy,
  name,
  cust,
} = require('../__fixtures__');

let Model;

const wrapConstructor = (discounts = []) => {
  return new DiscountFilter(
    new Model({ discounts }),
    'discounts',
  );
};

beforeAll(async () => {
  Model = mongoose.model(
    'DISCOUNTING',
    new mongoose.Schema({
      discounts: [DiscountSchema],
    }),
  );

  await mongoose.connect(process.env.CONNECTION);
});

describe('DiscountFilter', () => {
  describe('getEligibleDiscounts', () => {
    it('should filter out expired and upcoming discounts', () => {
      const inst = wrapConstructor([
        expired,
        foo,
        upcoming,
      ]);
      const result = inst.$getEligibleDiscounts(Boolean);
      expect(result).toHaveLength(1);
    });
  });

  describe('getDiscountByResourceName', () => {
    it('should find discounts by name', () => {
      const inst = wrapConstructor([foo, glob]);
      const result = inst.$getDiscountByResourceName('FOO');
      expect(result).toHaveLength(1);
    });
  });

  describe('getDiscountByTaxonomy', () => {
    it('should get taxonomy discounts', () => {
      const id = mongoose.Types.ObjectId();
      const inst = wrapConstructor([
        foo,
        glob,
        taxonomy(id),
      ]);
      const result = inst.getDiscountByTaxonomy(id);
      expect(result).toHaveLength(1);
    });
  });

  describe('getGlobalDiscount', () => {
    it('should get global discounts', () => {
      const inst = wrapConstructor([foo, glob]);
      const result = inst.getGlobalDiscount();
      expect(result).toHaveLength(1);
    });
  });

  describe('getIncrementalDiscountByResourceName', () => {
    it('should get discounts that meet kind and name critera', () => {
      const product = 'QUUZ';
      const inst = wrapConstructor([
        expired,
        upcoming,
        foo,
        glob,
        name(product),
      ]);
      const result = inst.getIncrementalDiscountByResourceName(
        product,
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('getCustomDiscountByResourceName', () => {
    it('should get active custom discounts', () => {
      const product = 'QUUZ';
      const inst = wrapConstructor([
        foo,
        glob,
        taxonomy(mongoose.Types.ObjectId()),
        cust(product),
      ]);
      const result = inst.getCustomDiscountByResourceName(
        product,
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('getBaseDiscount', () => {
    it('should return best value discount', () => {
      const resource = 'QUUZ';
      const tax = mongoose.Types.ObjectId();
      const inst = wrapConstructor([
        { kind: 'Retail', factor: 0.98, global: true },
        { kind: 'Retail', factor: 0.93, resource },
        { kind: 'Retail', factor: 0.91, taxonomy: tax },
        { kind: 'Retail', factor: 0.92, resource },
      ]);
      const result = inst.getBaseDiscount(resource, tax, {
        retail: 4.99,
      });

      expect(result).toHaveProperty('factor', 0.92);
    });

    it('should return best value taxonomy', () => {
      const resource = 'QUUZ';
      const tax = mongoose.Types.ObjectId();
      const inst = wrapConstructor([
        { kind: 'Retail', factor: 0.98, global: true },
        { kind: 'Retail', factor: 0.93, resource: 'NOOP' },
        { kind: 'Retail', factor: 0.91, taxonomy: tax },
        { kind: 'Retail', factor: 0.92, resource: 'HEY' },
      ]);
      const result = inst.getBaseDiscount(resource, tax, {
        retail: 4.99,
      });

      expect(result).toHaveProperty('factor', 0.91);
    });
  });

  describe('getAugmentedDiscount', () => {
    it('should return custom discount', () => {
      const resource = 'QUUZ';
      const inst = wrapConstructor([
        {
          kind: 'Incremental MSRP',
          factor: 0.87,
          resource,
        },
        { kind: 'Custom', factor: 3.5, resource },
      ]);
      const result = inst.getAugmentedDiscount(resource, {
        retail: 4.99,
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
        retail: 4.99,
        msrp: 5.99,
        volume: 4.49,
      };

      const inst = wrapConstructor([
        { kind: 'Volume', factor: 0.87, resource },
        {
          kind: 'Incremental MSRP',
          factor: 0.21,
          resource,
        },
      ]);
      const result = inst.getBlendedDiscount(
        resource,
        mongoose.Types.ObjectId(),
        pricing,
      );
      expect(pricing).toHaveProperty('discounted', 3.91);
      expect(result).toHaveProperty('factor', 0.21);
    });

    it('should assign a discount value a falsy value', () => {
      const resource = 'ADD';
      const pricing = {
        retail: 4.99,
        msrp: 5.99,
        volume: 4.49,
      };

      const inst = wrapConstructor([
        { kind: 'Volume', factor: 0.87, resource: 'NOOP' },
        {
          kind: 'Incremental MSRP',
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
        retail: 4.99,
        msrp: 5.99,
        volume: 4.49,
      };

      const inst = wrapConstructor([
        foo,
        { kind: 'Volume', factor: 0.91, taxonomy: tax },
      ]);
      const result = inst.getBlendedDiscount(
        'BAR',
        tax,
        pricing,
      );

      expect(pricing).toHaveProperty('discounted', 4.09);
      expect(result).toHaveProperty('factor', 0.91);
    });
  });
});
