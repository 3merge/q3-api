const session = require('.');
const { SESSION_KEY } = require('./constants');

describe('Session', () => {
  it('it should set namespace with user ID', (done) => {
    session.middleware({ user: 1 }, null, () => {
      expect(session.get(SESSION_KEY)).toBe(1);
      done();
    });
  });

  it('it clear namespace after request', (done) => {
    session.middleware({ user: 1 }, null, () => {
      session.kill();
      expect(session.get(SESSION_KEY)).toBeUndefined();
      done();
    });
  });

  it('it should enable external function to call', (done) => {
    const fn = () =>
      expect(session.get(SESSION_KEY)).toBe(1);

    session.middleware({ user: 1 }, null, () => {
      setTimeout(done, 200);
      fn();
    });
  });

  it('should return existing value', (done) => {
    session.middleware(null, null, () => {
      const v = 'FOO';
      session.nx(v, 1);
      session.nx(v, 2);
      expect(session.get(v)).toBe(1);
      done();
    });
  });

  it('should resolve function', (done) => {
    session.middleware(null, null, async () => {
      const v = 'FOO';
      await session.nx(v, Promise.resolve(1));
      session.nx(v, 2);
      expect(session.get(v)).toBe(1);
      done();
    });
  });
});
