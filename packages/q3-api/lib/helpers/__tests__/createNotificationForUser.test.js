const Mailer = require('q3-core-mailer/lib/core');
const session = require('q3-core-session');
const createNotificationForUser = require('../createNotificationForUser');

let fromDatabase;
let send;
let set;

beforeEach(() => {
  fromDatabase = jest
    .spyOn(Mailer.prototype, 'fromDatabase')
    .mockReturnValue(null);

  send = jest
    .spyOn(Mailer.prototype, 'send')
    .mockReturnValue(null);

  set = jest.spyOn(session, 'set').mockReturnValue(null);
});

describe('createNotificationForUser', () => {
  it('should set template, tenant and variables', async () => {
    process.env.WEB_APP = 'https://google.ca';
    send.mockImplementation(
      function testImplementationContext() {
        expect(this.meta).toMatchObject({
          template: 'en-foobar',
          to: 'test@user.net',
        });
      },
    );

    await createNotificationForUser(
      'foobar',
      ({ secret }) => ({ code: secret }),
    )({
      firstName: 'John',
      email: 'test@user.net',
      tenant: 'test',
      secret: 'foo',
    });

    expect(fromDatabase).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'foo',
        firstName: 'John',
        tenant: 'test',
        url: 'https://test.google.ca',
      }),
    );

    expect(send).toHaveBeenCalled();
    expect(set).toHaveBeenCalledWith('TENANT', 'test');
  });
});
