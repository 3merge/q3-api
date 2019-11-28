const Register = require('../controllers/register');

describe('Register', () => {
  describe('$mkt template function', () => {
    it('should return undefined', () => {
      const get = jest.fn();
      const app = { get };

      new Register(app, 'get').$mkt('get', [
        'foo',
        jest.fn(),
      ]);

      return expect(get).toHaveBeenCalledWith(
        'foo',
        expect.any(Function),
      );
    });
  });

  describe('makeList', () => {
    it('should call the template', () => {
      const get = jest.fn();
      const app = { get };

      new Register(app, 'get').makeGet('foo', jest.fn());
      return expect(get).toHaveBeenCalled();
    });

    it('should not call the template', () => {
      const get = jest.fn();
      const app = { get };

      new Register(app).makeGet('foo', jest.fn());
      return expect(get).not.toHaveBeenCalled();
    });
  });
});
