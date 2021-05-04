jest.mock('../redact', () => jest.fn().mockResolvedValue());

const { request } = require('..');

describe('postware', () => {
  it('should do nothing', async () => {
    const next = jest.fn();
    await request({}, {}, next);
    expect(next).toHaveBeenCalled();
  });

  it('should delete system props', () => {
    const body = {
      updatedAt: new Date(),
      foo: 'bar',
    };

    request({ body }, {}, jest.fn());
    expect(body).toHaveProperty('foo');
    expect(body).not.toHaveProperty('updatedAt');
  });
});
