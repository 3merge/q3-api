jest.mock('../../config/express', () => ({
  locals: {
    location: 'root',
  },
}));

jest.mock('q3-schema-utils', () => ({
  findFileTraversingUpwards: jest.fn(),
}));

const {
  findFileTraversingUpwards,
} = require('q3-schema-utils');

const {
  joinJsFileWithAppRoot,
  toUndefined,
  toQuery,
  getWebAppUrlByUser,
  checkAccessByFileNameAndRoleType,
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

describe('checkAccessByFileNameAndRoleType', () => {
  it('should throw error without matching user role', () => {
    findFileTraversingUpwards.mockReturnValue([
      {
        name: 'bar',
        role: ['Noop'],
      },
    ]);
    expect(() =>
      checkAccessByFileNameAndRoleType(
        {
          app: {
            locals: {
              location: 'foo',
            },
          },
          query: {
            template: 'bar',
          },
        },
        'sample.json',
      ),
    ).toThrowError();

    expect(findFileTraversingUpwards).toHaveBeenCalledWith(
      'foo',
      'sample.json',
    );
  });

  it('should continue without permissions', () => {
    findFileTraversingUpwards.mockReturnValue([]);
    expect(() =>
      checkAccessByFileNameAndRoleType(
        {
          app: {
            locals: {
              location: 'foo',
            },
          },
          query: {
            template: 'bar',
          },
        },
        'sample.json',
      ),
    ).not.toThrowError();

    expect(findFileTraversingUpwards).toHaveBeenCalledWith(
      'foo',
      'sample.json',
    );
  });

  it('should match with role type', () => {
    findFileTraversingUpwards.mockReturnValue([
      {
        name: 'bar',
        role: ['Matched'],
      },
    ]);
    expect(() =>
      checkAccessByFileNameAndRoleType(
        {
          app: {
            locals: {
              location: 'foo',
            },
          },
          query: {
            template: 'bar',
          },
          user: {
            role: 'Matched',
          },
        },
        'sample.json',
      ),
    ).not.toThrowError();

    expect(findFileTraversingUpwards).toHaveBeenCalledWith(
      'foo',
      'sample.json',
    );
  });
});
