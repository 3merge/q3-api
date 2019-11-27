const { Schema, model } = require('mongoose');
require('../comma');

let M;

beforeAll(() => {
  const testSchema = new Schema({
    test: Schema.Types.CommaDelimited,
  });

  M = model('CustomTypeExample', testSchema);
});

describe('CommaDelimited SchemaType', () => {
  it('should cast to lowercase', () => {
    const t = new M({
      test: 'Hey',
    });

    expect(t.test).toEqual(['hey']);
  });

  it('should stringify', () => {
    const t = new M({
      test: 'Hey, there, my, old, friend',
    });

    expect(t.test).toEqual([
      'hey',
      'there',
      'my',
      'old',
      'friend',
    ]);
  });

  it('should clean', () => {
    const t = new M({
      test: ['Hey ', 'there'],
    });

    expect(t.test).toEqual(['hey', 'there']);
  });

  it('should ignore', () => {
    const t = new M({
      test: 123,
    });

    expect(t.test).toEqual([]);
  });

  it('should throw on duplicate', () => {
    const doc = new M({
      test: 'hey, hey',
    });

    const err = doc.validateSync();
    expect(err.errors).toBeDefined();
    expect(err.errors).toHaveProperty('test');
  });
});
