require('q3-schema-types');

const mongoose = require('mongoose');
const DiscountSchema = require('..');

let Model;

beforeAll(async () => {
  DiscountSchema.set('base', 'test');
  Model = mongoose.model('DISCOUNTING', DiscountSchema);
  await mongoose.connect(process.env.CONNECTION);
});

describe('Discount Schema', () => {
  describe('Virtual setter/getter', () => {
    it('should return as percentage', () => {
      const inst = new Model({
        factor: 0.88,
        strategy: 'Incremental',
      });

      const inst2 = new Model({
        percentage: 12,
        strategy: 'Incremental',
      });

      expect(inst.percentage).toBe(12);
      expect(inst2.factor).toBe(0.88);
    });
  });

  describe('Validation', () => {
    it('should save resource-less as global', async () => {
      const inst = new Model({
        factor: 0.88,
        strategy: 'Incremental',
        resource: [''],
      });

      await inst.save();
      expect(inst.global).toBe(true);
      expect(inst.scope).toBe('Global');
    });
  });
});
