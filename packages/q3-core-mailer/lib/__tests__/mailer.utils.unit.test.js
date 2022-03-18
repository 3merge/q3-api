jest.mock('fs', () => ({
  readdirSync: jest.fn().mockReturnValue({
    forEach: jest.fn().mockImplementation((cb) => {
      cb();
    }),
  }),
}));

jest.mock('path', () => ({
  join: jest.fn(),
  basename: jest.fn().mockReturnValue('name.js'),
  extname: jest.fn(),
}));

jest.mock('../emitter', () => ({
  on: jest.fn(),
}));

const {
  filterByEmailValidity,
  prefix,
  getTemplate,
  reduceListenersByLang,
  getWebAppUrlAsTenantUser,
  cleanCallerResponse,
  convertFromCamelCase,
} = require('../utils');

describe('Mailer utils', () => {
  describe('"filterByEmailValidity"', () => {
    it('should serialize array of valid email addresses', () => {
      const a = filterByEmailValidity([
        'mibberson@3merge.ca ',
        'mibberson',
        'mibberson@3merge',
        'm.mibberson+alias@3merge.ca.uk',
      ]);
      expect(a).toMatch(
        'mibberson@3merge.ca, m.mibberson+alias@3merge.ca.uk',
      );
    });
  });

  describe('prefix', () => {
    it('should append v: to all keys in the object (non-nested)', () => {
      const out = prefix({
        foo: 1,
        bar: 1,
      });

      expect(out).toMatchObject({
        'v:foo': 1,
        'v:bar': 1,
      });
    });
  });

  describe('"getTemplate"', () => {
    it('should use template name', () =>
      expect(
        getTemplate('en', 'event', 'subscribe'),
      ).toMatch('en-subscribe'));

    it('should use event name', () =>
      expect(getTemplate('en', 'event')).toMatch(
        'en-event',
      ));
  });

  describe('"getTemplate"', () => {
    it('should use template name', () =>
      expect(
        getTemplate('en', 'event', 'subscribe'),
      ).toMatch('en-subscribe'));

    it('should use event name', () =>
      expect(getTemplate('en', 'event')).toMatch(
        'en-event',
      ));
  });

  describe('"reduceListenersByLang"', () => {
    const users = [
      {
        lang: 'en',
        role: 'Admin',
        email: 'mibberson@3merge.ca',
      },
      {
        lang: 'fr',
        role: 'Dev',
        email: 'mibberson@3merge.ca',
      },
    ];

    it('should group by lang', () => {
      const grouped = reduceListenersByLang(users);
      expect(grouped).toHaveProperty('en');
      expect(grouped).toHaveProperty('fr');
    });

    it('should assign URL', () => {
      const grouped = reduceListenersByLang(users, '/www');
      expect(grouped.en[0]).toHaveProperty('url', '/www');
    });

    it('should assign dynamic URL', () => {
      const grouped = reduceListenersByLang(users, (r) =>
        r === 'Admin' ? '/admin' : '/dev',
      );

      expect(grouped.en[0]).toHaveProperty('url', '/admin');
      expect(grouped.fr[0]).toHaveProperty('url', '/dev');
    });
  });

  describe('getWebAppUrlAsTenantUser', () => {
    it('should insert tenant into URL as subdomain', () => {
      process.env.WEB_APP = 'https://google.ca';
      const out = getWebAppUrlAsTenantUser({
        tenant: '3merge',
      });

      expect(out).toMatch('https://3merge.google.ca');
    });

    it('should return virgin URL', () => {
      process.env.WEB_APP = 'https://google.ca';
      const out = getWebAppUrlAsTenantUser({
        tenant: null,
      });

      expect(out).toMatch('https://google.ca');
    });
  });

  describe('cleanCallerREsponse', () => {
    it('should just get filename', () => {
      expect(
        cleanCallerResponse('/myfiles/name.js'),
      ).toEqual('name');
    });
  });

  describe('convertFromCamelCase', () => {
    it('should combine with lang', () => {
      expect(convertFromCamelCase('foobar')).toEqual(
        'foobar',
      );
    });

    it('should format and combine with lang', () => {
      expect(convertFromCamelCase('onFooBar')).toEqual(
        'foo-bar',
      );
    });
  });
});
