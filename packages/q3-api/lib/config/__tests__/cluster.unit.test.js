/* eslint-disable global-require */
jest.mock('os', () => ({
  cpus: jest.fn().mockReturnValue(
    Array.from({
      length: 5,
    }),
  ),
}));

const setEnv = (env = {}) =>
  Object.assign(process, {
    env,
  });

const setConcurrencyEnv = (v) =>
  setEnv({
    WEB_CONCURRENCY: v,
  });

const setEnvironmentVarEnv = (v) =>
  setEnv({
    NODE_ENV: v,
  });

beforeEach(() => {
  jest.resetModules();
});

afterEach(() => {
  setEnv({});
});

describe('cluster', () => {
  describe('"concurrencySetting"', () => {
    it('should return WEB_CONCURRENCY', () => {
      const setting = 3;
      setConcurrencyEnv(setting);
      expect(require('../cluster')).toHaveProperty(
        'concurrencySetting',
        setting,
      );
    });

    it('should return os cpu length', () =>
      expect(require('../cluster')).toHaveProperty(
        'concurrencySetting',
        5,
      ));
  });

  describe('"isWorkerEnvironment"', () => {
    it('should return truthy', () => {
      setEnvironmentVarEnv('development');
      jest.mock('cluster', () => ({
        isWorker: true,
      }));

      expect(require('../cluster')).toHaveProperty(
        'isWorkerEnvironment',
        true,
      );
    });

    it('should return falsy ', () => {
      setEnvironmentVarEnv('production');
      jest.mock('cluster', () => ({
        isWorker: false,
      }));

      expect(require('../cluster')).toHaveProperty(
        'isWorkerEnvironment',
        false,
      );
    });

    it('should return falsy while testing', () => {
      setEnvironmentVarEnv('test');
      jest.mock('cluster', () => ({
        isWorker: true,
      }));

      expect(require('../cluster')).toHaveProperty(
        'isWorkerEnvironment',
        false,
      );
    });
  });

  describe('"isMasterEnvironment"', () => {
    it('should iterate over concurrency setting', () => {
      const setting = 4;
      setConcurrencyEnv(setting);
      setEnvironmentVarEnv('production');

      jest.mock('cluster', () => ({
        isMaster: true,
        fork: jest.fn(),
        on: jest.fn(),
      }));

      require('../cluster');
      expect(require('cluster').fork).toHaveBeenCalledTimes(
        setting + 1,
      );
    });
  });
});
