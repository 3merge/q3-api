require('q3-schema-types');

const mongoose = require('mongoose');
const DiscountSchema = require('..');

let Model;

beforeAll(async () => {
  DiscountSchema.set('base', 'test');
  Model = mongoose.model('DISCOUNTING', DiscountSchema);
  await mongoose.connect(process.env.CONNECTION);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Discount Schema', () => {
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
