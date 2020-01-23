const mongoose = require('mongoose');
const {
  getPluralizedCollectionName,
  hasCollection,
} = require('../plugin');

beforeAll(async () => {
  const Foo = mongoose.model(
    'foo',
    new mongoose.Schema({ name: String }),
  );

  await mongoose.connect(process.env.CONNECTION);
  await Foo.create({ name: 'Bar' });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Permissions plugin helpers', () => {
  describe('"getPluralizedCollectionName"', () => {
    it('should not match name', () => {
      const re = getPluralizedCollectionName('orders');
      expect(re.test('q3-orders')).toBeFalsy();
    });

    it('should match name', () => {
      const re = getPluralizedCollectionName('orders');
      expect(re.test('orders')).toBeTruthy();
    });

    it('should match name regardless of case', () => {
      const re = getPluralizedCollectionName('orders');
      expect(re.test('ORDERS')).toBeTruthy();
    });
  });

  describe('"hasCollection"', () => {
    it('should return truthy', () =>
      expect(hasCollection('foos')).resolves.toBeTruthy());

    it('should return falsy', () =>
      expect(hasCollection('bars')).resolves.toBeFalsy());
  });
});
