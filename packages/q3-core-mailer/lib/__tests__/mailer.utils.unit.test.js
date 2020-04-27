jest.mock('fs', () => ({
  readdirSync: jest.fn().mockReturnValue({
    forEach: jest.fn().mockImplementation((cb) => {
      cb();
    }),
  }),
}));

jest.mock('path', () => ({
  join: jest.fn(),
  basename: jest.fn(),
  extname: jest.fn(),
}));

jest.mock('../emitter', () => ({
  on: jest.fn(),
}));

const { basename } = require('path');
const { on } = require('../emitter');

const {
  filterByEmailValidity,
  prefix,
  discoverEmailListenersInDir,
  getTemplate,
  reduceListenersByLang,
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

  describe('"discoverEmailListenersInDir"', () => {
    it('should not register event listeners for non-prefixed files', () => {
      basename.mockReturnValue('foo');
      discoverEmailListenersInDir();
      expect(on).not.toHaveBeenCalled();
    });

    it('should register event listeners for all files starting with "on"', () => {
      basename.mockReturnValue('onEvent');
      discoverEmailListenersInDir();
      expect(on).toHaveBeenCalled();
    });
  });

  describe('"getTemplate"', () => {
    it('should use template name', () =>
      expect(
        getTemplate('en-CA', 'event', 'subscribe'),
      ).toMatch('en-subscribe'));

    it('should use event name', () =>
      expect(getTemplate('en-CA', 'event')).toMatch(
        'en-event',
      ));
  });

  describe('"getTemplate"', () => {
    it('should use template name', () =>
      expect(
        getTemplate('en-CA', 'event', 'subscribe'),
      ).toMatch('en-subscribe'));

    it('should use event name', () =>
      expect(getTemplate('en-CA', 'event')).toMatch(
        'en-event',
      ));
  });

  describe('"reduceListenersByLang"', () => {
    const users = [
      {
        lang: 'en-CA',
        role: 'Admin',
        email: 'mibberson@3merge.ca',
      },
      {
        lang: 'fr-CA',
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
});
