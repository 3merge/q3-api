const BatchQueryLoader = require('../../lib/BatchQueryLoader');

describe('BatchQueryLoader', () => {
  describe('"invokeJson"', () => {
    it('should invoke toJSON method', () => {
      const toJSON = jest.fn();
      const out = BatchQueryLoader.invokeJson({
        toJSON,
      });

      expect(toJSON).toHaveBeenCalled();
      expect(out).toBeUndefined();
    });

    it('should not invoke the toJSON method', () => {
      const out = BatchQueryLoader.invokeJson({ foo: 1 });
      expect(out).toHaveProperty('foo');
    });
  });

  describe('"isEmbeddedPath"', () => {
    const checkEmbeddedPathSpec = (a, b) =>
      expect(BatchQueryLoader.isEmbeddedPath(a, b));

    it('should match simple paths', () =>
      checkEmbeddedPathSpec(
        'single',
        'single._bsontype',
      ).toBeTruthy());

    it('should not match wrong paths', () =>
      checkEmbeddedPathSpec(
        'single',
        'double._bsontype',
      ).toBeFalsy());

    it('should match simple nested paths', () =>
      checkEmbeddedPathSpec(
        'foo.bar',
        'foo.bar._bsontype',
      ).toBeTruthy());

    it('should match embedded nested paths', () =>
      checkEmbeddedPathSpec(
        'foo.bar',
        'foo.1.bar._bsontype',
      ).toBeTruthy());

    it('should match without _bsontype', () =>
      checkEmbeddedPathSpec(
        'foo.bar',
        'foo.1.bar',
      ).toBeTruthy());
  });
});
