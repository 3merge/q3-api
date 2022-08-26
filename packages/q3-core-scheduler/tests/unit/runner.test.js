const path = require('path');
const runner = require('../../lib/runner');

jest.mock('mjml-core/lib/helpers/mjmlconfig');

describe('Runner', () => {
  it('should return recurring jobs', () => {
    const r = runner(
      path.resolve(__dirname, '../fixtures'),
    );

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
