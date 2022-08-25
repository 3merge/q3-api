jest.mock('moment', () => jest.fn());

const moment = require('moment');
const {
  isRecurringJob,
  getInterval,
  getNextDate,
  getStatus,
  makePayload,
} = require('../../lib/utils');
const { FAILED, STALLED } = require('../../lib/constants');

describe('Utils', () => {
  describe.each([
    ['onSingle.js', false],
    ['onRecurring@hourly.js', true],
  ])('isRecurringJob(%s)', (a, expected) => {
    test(`returns ${expected}`, () =>
      expect(isRecurringJob(a)).toBe(expected));
  });

  describe.each([
    ['onSingle', undefined],
    ['onRecurring@hourly', 'hourly'],
  ])('getInterval(%s)', (a, expected) => {
    test(`returns ${expected}`, () =>
      expect(getInterval(a)).toBe(expected));
  });

  describe('"getNextDate"', () => {
    it('should increment date', (done) => {
      moment.mockReturnValue({
        add: jest.fn().mockImplementation((a, b) => {
          expect(a).toBe(30);
          expect(b).toBe('minutes');
          done();
        }),
      });

      getNextDate('semihourly');
    });
  });

  describe('"getStatus"', () => {
    it('should return failed', () => {
      expect(getStatus(5)).toMatch(FAILED);
    });

    it('should return stalled', () => {
      expect(getStatus(1)).toMatch(STALLED);
    });
  });

  describe('makePayload', () => {
    it('should return string', () => {
      expect(makePayload()).toBe('');
    });

    it('should strip out sensitive fields', () => {
      expect(makePayload({ test: 1, apiKeys: [1] })).toBe(
        JSON.stringify({ test: 1 }),
      );
    });

    it('should strip out sensitive fields', () => {
      expect(
        makePayload({
          test: 1,
          session: { test: 1, password: 1 },
        }),
      ).toBe(
        JSON.stringify({ test: 1, session: { test: 1 } }),
      );
    });

    it('should strip out sensitive fields', () => {
      expect(
        makePayload({
          test: 1,
          session: {
            USER: {
              test: 1,
              secretIssuedOn: 1,
            },
          },
        }),
      ).toBe(
        JSON.stringify({
          test: 1,
          session: {
            USER: {
              test: 1,
            },
          },
        }),
      );
    });
  });
});
