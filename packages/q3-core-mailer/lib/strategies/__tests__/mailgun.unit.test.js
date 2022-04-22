jest.mock('mailgun.js', () => {
  const create = jest.fn();
  class MailgunMock {
    // eslint-disable-next-line
    client() {
      return {
        messages: {
          create,
        },
      };
    }
  }

  MailgunMock.create = create;
  return MailgunMock;
});

const mock = require('mailgun.js');
const mg = require('../mailgun');

describe('Mailgun', () => {
  it('should resolve', () => {
    process.env.MAILGUN_DOMAIN = 'testdomain.net';
    process.env.MAILGUN_DEBUG = true;

    mock.create.mockResolvedValue(true);
    expect(mg().send()).resolves.toBeTruthy();
    expect(mock.create).toHaveBeenCalledWith(
      'testdomain.net',
      {
        'o:testmode': 'yes',
      },
    );
  });

  it('should reject', () => {
    process.env.MAILGUN_DOMAIN = 'testdomain.net';
    process.env.MAILGUN_DEBUG = false;

    mock.create.mockRejectedValue(new Error());
    expect(mg().send()).rejects.toThrowError();
    expect(mock.create).toHaveBeenCalledWith(
      'testdomain.net',
      {},
    );
  });
});
