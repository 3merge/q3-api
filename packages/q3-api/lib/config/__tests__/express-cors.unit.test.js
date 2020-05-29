const cors = require('../express-cors');

describe('cors', () => {
  beforeEach(() => {
    process.env.WHITELIST_CORS = null;
  });

  it('should allow whitelisted origins and not call onCors', async () => {
    const url = 'http://localhost:9000';
    const fn = jest.fn();
    const onCors = jest.fn();
    process.env.WHITELIST_CORS = url;
    await cors({ locals: { onCors } }).origin(url, fn);
    expect(fn).toHaveBeenCalledWith(null, true);
    expect(onCors).not.toHaveBeenCalled();
  });

  it('should allow all origins', async () => {
    const url = 'http://localhost:9000';
    const fn = jest.fn();
    await cors({}).origin(url, fn);
    expect(fn).toHaveBeenCalledWith(null, true);
  });

  it('should block origin unless whitelisted', async () => {
    const url = 'http://localhost:9000';
    const fn = jest.fn();
    process.env.WHITELIST_CORS = url;
    await cors({}).origin('www.goo.com', fn);
    expect(fn).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should call onCors', async () => {
    const fn = jest.fn();
    const onCors = jest.fn();
    const origin = 'http://localhost:9001';
    process.env.WHITELIST_CORS = 'http://localhost:9000';

    await cors({ locals: { onCors } }).origin(origin, fn);
    expect(onCors).toHaveBeenCalledWith(origin);
    expect(fn).toHaveBeenCalledWith(null, true);
  });

  it('should throw on onCors', async () => {
    const fn = jest.fn();
    const onCors = jest
      .fn()
      .mockRejectedValue(new Error('FOO!'));

    const origin = 'http://localhost:9001';
    process.env.WHITELIST_CORS = 'http://localhost:9000';

    await cors({ locals: { onCors } }).origin(origin, fn);
    expect(onCors).toHaveBeenCalledWith(origin);
    expect(fn).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should allow server-to-server', async () => {
    const fn = jest.fn();
    await cors({
      locals: { enableServerToServer: true },
    }).origin(null, fn);
    expect(fn).toHaveBeenCalledWith(null, true);
  });

  it('should still prohibit browser requests on server-to-server', async () => {
    const fn = jest.fn();
    process.env.WHITELIST_CORS = 'http://bar.ca';
    await cors({
      locals: { enableServerToServer: true },
    }).origin('http://foo.com', fn);
    expect(fn).toHaveBeenCalledWith(expect.any(Error));
  });
});
