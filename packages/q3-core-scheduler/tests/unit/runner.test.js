const path = require('path');

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
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

  it('should get from directory', () => {
    expect(
      runner(
        path.join(__dirname, '../fixtures'),
      ).getFunctionFromFileSystem('sample.js'),
    ).toHaveProperty('name', 'SampleFunction');
  });

  it('should get from node_modules', () => {
    expect(
      runner(
        path.join(__dirname, '../fixtures'),
      ).getFunctionFromFileSystem('onNewUser.js'),
    ).toHaveProperty('name', '');
  });

  it('should error from node_modules', () => {
    expect(() =>
      runner(
        path.join(__dirname, '../fixtures'),
      ).getFunctionFromFileSystem('onCustomTest.js'),
    ).toThrowError();
  });
});
