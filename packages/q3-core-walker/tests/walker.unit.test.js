const { resolve, join } = require('path');
const testUtils = require('..');

describe('appendID', () => {
  const fn = testUtils.__get__('appendID');

  it('should add a colon and ID', () => {
    expect(fn('foo')).toBe(':fooID');
  });
});

describe('getNestedPath', () => {
  const fn = testUtils.__get__('getNestedPath');

  it('should separate relative paths with IDs', () => {
    expect(fn('foo\\bar')).toBe('foo/:fooID/bar');
  });

  it('should append ID if file path suggests it', () => {
    expect(fn('foo', 'foo.id.js')).toBe('foo/:fooID');
  });
});

describe('getVerb', () => {
  const fn = testUtils.__get__('getVerb');

  it('should return "use" without a match', () => {
    expect(fn('batch')).toBe('use');
  });

  it('should return "get" from file name', () => {
    expect(fn('get.id.js')).toBe('get');
  });
});

describe('DirectoryWalker', () => {
  let inst;
  const mocks = resolve(__dirname, '../__mocks__');
  const filename = 'middleware.js';

  beforeAll(() => {
    const Walker = testUtils.__get__('DirectoryWalker');
    inst = new Walker(__dirname);
  });

  it('should return an export', () => {
    inst.setContext(mocks, filename);
    expect(inst.getController()).toEqual(
      expect.any(Function),
    );
  });

  it('should return an API URI', () => {
    inst.setContext(join(__dirname, 'test'), 'get.id.js');
    expect(inst.getSlug()).toBe('/test/:testID');
  });

  it('should register a new route', () => {
    const app = { use: jest.fn() };
    inst.setContext(mocks, filename);
    inst.exec(app);
    expect(app.use).toHaveBeenCalled();
  });
});
