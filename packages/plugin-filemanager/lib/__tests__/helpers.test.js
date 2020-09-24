const {
  mapAsFileObject,
  reduceByFileName,
  startsWith,
} = require('../helpers');

const makeStartsWithAssertion = (value) =>
  expect(startsWith('foo/bar.js', value));

describe('PluginFilemanager helpers', () => {
  describe('"reduceByFileName"', () => {
    it('should reduce files by file name', () =>
      expect(
        reduceByFileName({
          foo: {
            data: 1,
            name: 'foo.png',
          },
        }),
      ).toEqual({
        'foo.png': 'foo',
      }));

    it('should return empty object', () =>
      expect(reduceByFileName(1)).toEqual({}));
  });

  describe('"mapAsFileObject"', () => {
    it('should append options', () =>
      expect(
        mapAsFileObject(
          { foo: { name: 'foo', file: 1 } },
          'abc',
          {
            sensitive: true,
          },
        ),
      ).toEqual([
        {
          filename: 'abc/foo',
          data: expect.any(Object),
          sensitive: true,
        },
      ]));

    it('should return empty array', () =>
      expect(mapAsFileObject([])).toEqual([]));
  });

  describe('"startsWith"', () => {
    it('should match', () =>
      makeStartsWithAssertion('foo').toBeTruthy());

    it('should not match', () =>
      makeStartsWithAssertion('quuz').toBeFalsy());
  });
});
