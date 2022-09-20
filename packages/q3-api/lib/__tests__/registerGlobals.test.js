const path = require('path');
const registerGlobals = require('../registerGlobals');

beforeEach(() => {
  delete global.getMailerVars;
  delete global.foobar;
});

describe('registerGlobals', () => {
  it('should do nothing', () => {
    registerGlobals(path.resolve(__dirname, '../chores'));
    expect(global.getMailerVars).toBeUndefined();
  });

  it('should register whitelisted function names', () => {
    registerGlobals(
      path.resolve(__dirname, '../__fixtures__'),
    );

    expect(global.getMailerVars).toEqual(
      expect.any(Function),
    );
    expect(global.foobar).toBeUndefined();
  });
});
