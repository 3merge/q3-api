const { casters } = require('..');

describe('Setters', () => {
  describe('toUndefined', () => {
    it('should return undefined', () =>
      expect(casters.toUndefined('')).toBeUndefined());

    it('should return null', () =>
      expect(casters.toUndefined(null)).toBeUndefined());
  });

  describe('toQuery', () => {
    it('should return without template var', () => {
      const q = casters.toQuery({
        originalUrl: '//google.ca?template=foo&bar=1',
      });

      expect(q).not.toHaveProperty('template');
      expect(q).toHaveProperty('bar', 1);
    });
  });
});
