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
});
