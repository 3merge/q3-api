require('q3-schema-types');

const mongoose = require('mongoose');
const Schema = require('..');

Schema.set('base', 'test');
const Model = mongoose.model('Discounts', Schema);

describe('Decorator', () => {
  describe('evaluate', () => {
    it('should return 0 by default', () => {
      const m = new Model({
        formula: 'Compound',
        strategy: 'MSRP',
        factor: 11,
      });

      expect(m.evaluate()).toBe(0);
    });

    it('should use fallback pricing', () => {
      const m = new Model({
        formula: 'Incremental',
        strategy: 'MSRP',
        factor: 0.88,
      });

      expect(m.evaluate({ MSRP: 45.99, test: 28.11 })).toBe(
        22.59,
      );
    });

    it('should return Factor-discounted price', () => {
      const m = new Model({
        formula: 'Factor',
        strategy: 'test',
        factor: 0.88,
      });

      expect(m.evaluate({ test: 11.99 })).toBe(10.55);
    });

    it('should return Compound-discount price', () => {
      const m = new Model({
        formula: 'Compound',
        strategy: 'MSRP',
        factor: 11,
        base: 22.22,
      });

      expect(
        m.evaluate({
          test: 20,
          MSRP: 11.99,
        }),
      ).toBe(11.22);
    });

    it('should return Compound-discount without base', () => {
      const m = new Model({
        formula: 'Compound',
        factor: 11,
      });

      expect(
        m.evaluate({
          test: 20,
        }),
      ).toBe(9);
    });

    it('should return Percent-discount as off', () => {
      const m = new Model({
        formula: 'Percent',
        factor: 10,
        strategy: 'test',
      });

      expect(
        m.evaluate({
          test: 20,
        }),
      ).toBe(18);
    });

    it('should return negative value for percent off', () => {
      const m = new Model({
        formula: 'Percent',
        factor: 110,
        strategy: 'test',
      });

      expect(
        m.evaluate({
          test: 20,
        }),
      ).toBe(-2);
    });

    it('should return Incremental-discounted price', () => {
      const m = new Model({
        formula: 'Incremental',
        strategy: 'MSRP',
        factor: 0.12,
      });

      expect(
        m.evaluate({
          test: 20,
          MSRP: 11.99,
        }),
      ).toBe(9.45);
    });

    it('should return Fixed-discounted price', () => {
      const m = new Model({
        formula: 'Fixed',
        factor: 8.99,
      });

      expect(
        m.evaluate({
          test: 20,
          MSRP: 11.99,
        }),
      ).toBe(8.99);
    });
  });

  describe('diff', () => {
    it('should calculate the difference between input and outout', () => {
      const m = new Model({
        formula: 'Fixed',
        factor: 4.99,
      });

      expect(m.diff({ test: 20 })).toBe(15.01);
    });

    it('should calculate the incremented difference between input and outout', () => {
      const m = new Model({
        formula: 'Compound',
        factor: 8.99,
        base: 11.99,
      });

      expect(m.diff({ test: 19.99 })).toBe(16.99);
    });
  });
});
