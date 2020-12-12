jest.mock('moment', () => jest.fn());

const moment = require('moment');
const {
  isRecurringJob,
  getInterval,
  getNextDate,
  getStatus,
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
});
