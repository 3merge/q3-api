const session = require('.');
const { SESSION_KEY } = require('./constants');

describe('Session', () => {
  describe('"get"', () => {
    it('it should get namespace with user ID', (done) => {
      session.middleware({ user: 1 }, null, () => {
        expect(session.get(SESSION_KEY)).toBe(1);
        done();
      });
    });

    it('it clear namespace after request', (done) => {
      session.middleware({ user: 1 }, null, () => {
        expect(session.get(SESSION_KEY)).toBeDefined();
        session.kill();
        expect(session.get(SESSION_KEY)).toBeUndefined();
        done();
      });
    });

    it('it should get attribute of namespace', (done) => {
      session.middleware(
        { user: { id: 1, name: { sur: 'foo' } } },
        null,
        () => {
          expect(session.get(SESSION_KEY, 'id')).toBe(1);
          expect(session.get(SESSION_KEY, 'name.sur')).toBe(
            'foo',
          );

          expect(
            session.get(SESSION_KEY, 'unknown', true),
          ).toBe(true);

          done();
        },
      );
    });

    it('it should invoke getter', (done) => {
      const get = jest.fn().mockReturnValue(1);

      session.middleware(
        { user: { id: 1, get } },
        null,
        () => {
          expect(session.get(SESSION_KEY, 'test')).toBe(1);
          expect(get).toHaveBeenCalledWith('test');

          done();
        },
      );
    });

    it('it should provide default value', (done) => {
      const get = jest.fn().mockReturnValue(undefined);

      session.middleware(
        { user: { id: 1, get } },
        null,
        () => {
          expect(
            session.get(SESSION_KEY, 'test', 'foo'),
          ).toBe('foo');
          expect(get).toHaveBeenCalledWith('test');

          done();
        },
      );
    });
  });

  describe('"set"', () => {
    it('it should enable external function to call', (done) => {
      const fn = () =>
        expect(session.get(SESSION_KEY)).toBe(1);

      session.middleware({ user: 1 }, null, () => {
        setTimeout(done, 200);
        fn();
      });
    });
  });

  describe('"nx"', () => {
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

  describe('"intercept"', () => {
    it('should dynamically set context', (done) => {
      const v = 'FOO';
      const req = { foo: 1 };

      session.intercept(v, (r) => {
        expect(r).toMatchObject(req);
        return r.foo;
      });

      session.middleware(req, null, async () => {
        expect(session.get(v)).toBe(1);
        session.kill();
        done();
      });
    });
  });
});
