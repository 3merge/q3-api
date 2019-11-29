const { getNestedPath, getVerb } = require('../utils');

describe('getNestedPath', () => {
  it('should separate relative paths with IDs', () =>
    expect(getNestedPath('foo\\bar')).toBe(
      'foo/:fooID/bar',
    ));

  it('should append ID if file path suggests it', () =>
    expect(getNestedPath('foo', 'foo.id.js')).toBe(
      'foo/:fooID',
    ));
});

describe('getVerb', () => {
  it('should return `use` without a match', () =>
    expect(getVerb('batch')).toBe('use'));

  it('should return `get` from file name', () =>
    expect(getVerb('get.id.js')).toBe('get'));
});
