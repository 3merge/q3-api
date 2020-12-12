jest.mock('fs', () => ({
  readdirSync: jest
    .fn()
    .mockReturnValue([
      'onSingle',
      'onRecurring@minutely',
      'onRecurring@hourly',
      'utils',
    ]),
}));

const runner = require('../../lib/runner');

describe('Runner', () => {
  it('should return recurring jobs', () => {
    const r = runner('dir');
    const jobs = r.walk();
    expect(jobs).toHaveLength(2);
    expect(jobs.every((v) => v.includes('@'))).toBeTruthy();
  });
});
