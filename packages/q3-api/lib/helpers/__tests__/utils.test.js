jest.mock('../../config/express', () => ({
  locals: {
    location: 'root',
  },
}));

const {
  joinJsFileWithAppRoot,
  toUndefined,
  toQuery,
  getWebAppUrlByUser,
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

describe('getWebAppUrlByUser', () => {
  it('should return WEB_APP', () => {
    const url = 'https://google.ca';
    process.env.WEB_APP = url;
    expect(getWebAppUrlByUser()).toMatch(url);
  });

  it('should return tenanted WEB_APP', () => {
    const url = 'https://google.ca';
    process.env.WEB_APP = url;
    expect(
      getWebAppUrlByUser({
        tenant: 'foobar',
      }),
    ).toMatch('https://foobar.google.ca');
  });
});
