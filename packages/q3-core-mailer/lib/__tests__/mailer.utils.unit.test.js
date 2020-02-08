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
});
