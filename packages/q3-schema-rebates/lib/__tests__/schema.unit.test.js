const { model } = require('mongoose');
const Schema = require('../schema');

let M;

beforeAll(async () => {
  M = await model('Rebate_Mock', Schema);
});

describe('Rebate validation', () => {
  it('should fail without required fields', () => {
    const s = new M({});
    const err = s.validateSync();
    expect(err.errors).toBeDefined();
    expect(err.errors).toHaveProperty('name');
    expect(err.errors).toHaveProperty('description');
  });

  it('should set default properties', () => {
    const s = new M({});
    expect(s).toHaveProperty('symbol', '$');
    expect(s).toHaveProperty('currency', 'CAD');
  });

  it('should restrict negative values', () => {
    const s = new M({ value: -20 });
    const err = s.validateSync();
    expect(err.errors).toBeDefined();
    expect(err.errors).toHaveProperty('value');
  });

  it('should restrict unknown symbols and currencies', () => {
    const s = new M({ symbol: '!', currency: 'UK' });
    const err = s.validateSync();
    expect(err.errors).toBeDefined();
    expect(err.errors).toHaveProperty('symbol');
    expect(err.errors).toHaveProperty('currency');
  });

  it('should reject conditional threshold without a sku', () => {
    const s = new M({ conditionalSkuThreshold: 1 });
    const err = s.validateSync();
    expect(err.errors).toBeDefined();
    expect(err.errors).toHaveProperty(
      'conditionalSkuThreshold',
    );
  });

  it('should allow conditional threshold with a sku', () => {
    const s = new M({
      conditionalSkuThreshold: 1,
      conditionalSkus: 'One,Two',
    });
    const err = s.validateSync();
    expect(err.errors).not.toHaveProperty(
      'conditionalSkuThreshold',
    );
  });
});
