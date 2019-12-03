const MockApi = require('q3-test-utils/helpers/apiMock');
const moment = require('moment');
const Decorator = require('../status');

const { req, res } = new MockApi();

describe('Status decorator', () => {
  it('should set the last modified date', () => {
    Decorator(req, res, jest.fn());
    const today = moment();

    res.set = jest.fn();
    req.marshal({
      updatedAt: today,
    });

    expect(res.set).toHaveBeenCalledWith(
      'Last-Modified',
      today,
    );
  });

  it('should set aggregate last modified date', () => {
    Decorator(req, res, jest.fn());
    const previousYesterday = moment().subtract(2, 'days');
    const yesterday = moment().subtract(1, 'days');
    const today = moment();

    res.set = jest.fn();
    req.marshal([
      { updatedAt: yesterday },
      { updatedAt: today },
      { updatedAt: previousYesterday },
    ]);

    expect(res.set).toHaveBeenCalledWith(
      'Last-Modified',
      today,
    );
  });
});
