jest.mock('../../config/express', () => ({
  locals: {
    location: 'root',
  },
}));

const {
  joinJsFileWithAppRoot,
  toUndefined,
  toQuery,
} = require('../utils');

describe('Setters', () => {
  describe('toUndefined', () => {
    it('should return undefined', () =>
      expect(toUndefined('')).toBeUndefined());

    it('should return null', () =>
      expect(toUndefined(null)).toBeUndefined());
  });

  describe('toQuery', () => {
    it('should return without template var', () => {
      const q = toQuery({
        originalUrl: '//google.ca?template=foo&bar=1',
      });

      expect(q).not.toHaveProperty('template');
      expect(q).toHaveProperty('bar', 1);
    });
  });
});

describe('joinJsFileWithAppRoot', () => {
  it('should return js file', () =>
    expect(joinJsFileWithAppRoot('folder', 'file')).toMatch(
      'root\\folder\\file.js',
    ));
});
