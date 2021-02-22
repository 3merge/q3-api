const MockApi = require('q3-test-utils/helpers/apiMock');
const moment = require('moment');
const Decorator = require('../status');

const { req, res } = new MockApi();
const today = moment();
const previousYesterday = moment().subtract(2, 'days');

beforeEach(() => {
  req.headers = {};
  res.status = jest.fn().mockReturnValue({
    send: jest.fn(),
  });
});

describe('Status decorator', () => {
  test.skip('should set the last modified date', () => {
    Decorator(req, res, jest.fn());
    res.set = jest.fn();
    req.marshal({
      updatedAt: today,
    });

    expect(res.set).toHaveBeenCalledWith(
      'Last-Modified',
      today,
    );
  });

  test.skip('should set aggregate last modified date', () => {
    Decorator(req, res, jest.fn());
    const yesterday = moment().subtract(1, 'days');

    res.set = jest.fn();
    req.marshal([
      { updatedAt: yesterday },
      { updatedAt: today },
      { updatedAt: previousYesterday },
    ]);

    expect(res.set).toHaveBeenCalledWith(
      'Last-Modified',
      today.toISOString(),
    );
  });
});
