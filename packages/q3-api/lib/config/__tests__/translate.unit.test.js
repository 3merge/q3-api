const i18 = require('i18next');
const { translate } = require('../i18next');

jest.mock('i18next', () => ({
  t: jest.fn(),
  use: jest.fn().mockReturnValue({
    init: jest.fn(),
  }),
}));

describe('translate', () => {
  it('should invoke `t` method', () => {
    translate('foo');
    expect(i18.t).toHaveBeenCalledWith('foo', null);
  });

  it('should invoke `t` method with sprintf', () => {
    translate('foo', [1]);
    expect(i18.t).toHaveBeenCalledWith('foo', {
      postProcess: expect.any(String),
      sprintf: expect.any(Array),
    });
  });
});
