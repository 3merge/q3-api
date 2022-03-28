const mongoose = require('mongoose');
const {
  compareValues,
  filterByResourceName,
} = require('../helpers');
const DiscountSchema = require('..');

DiscountSchema.set('target', 'normal');

const DiscountModel = mongoose.model(
  'discount-helpers',
  DiscountSchema,
);

describe('helpers', () => {
  describe('compareValues', () => {
    it('should find distance between two numbers', () => {
      const winner = compareValues(
        [
          new DiscountModel({
            formula: 'Percent',
            strategy: 'msrp',
            factor: 0.2,
          }),
          new DiscountModel({
            formula: 'Factor',
            strategy: 'normal',
            factor: 0.9,
          }),
        ],
        {
          normal: 12.99,
          msrp: 33.99,
        },
      );

      expect(winner).toHaveProperty('factor', 0.9);
    });
  });

  describe('filterByResourceName', () => {
    it('should match two strings', () => {
      expect(
        filterByResourceName('foo')({
          resource: ['foo'],
        }),
      ).toBeTruthy();
    });

    it('should match by regex', () => {
      expect(
        filterByResourceName('fo0')({
          resource: ['f*'],
        }),
      ).toBeTruthy();
    });

    it('should match by regex', () => {
      expect(
        filterByResourceName('bar')({
          resource: ['foo'],
        }),
      ).toBeFalsy();
    });
  });
});
