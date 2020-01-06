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

  describe('isFresh', () => {
    test.skip('should response with 412', () => {
      Decorator(req, res, jest.fn());
      req.headers = {};
      res.status = jest.fn().mockReturnValue({
        send: jest.fn(),
      });

      req.headers[
        'if-unmodified-since'
      ] = previousYesterday;

      req.isFresh(today);
      expect(res.status).toHaveBeenCalledWith(412);
    });

    test.skip('should respond as truthy', () => {
      Decorator(req, res, jest.fn());
      req.headers = {};
      res.status = jest.fn().mockReturnValue({
        send: jest.fn(),
      });

      req.headers['if-unmodified-since'] = today;

      expect(req.isFresh(previousYesterday)).toBeTruthy();
    });

    test.skip('should respond as truthy in equal-to situations', () => {
      Decorator(req, res, jest.fn());
      req.headers['if-unmodified-since'] = today;
      expect(req.isFresh(today)).toBeTruthy();
    });
  });
});
