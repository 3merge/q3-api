const mailer = require('..');

jest.mock('../strategies/mailgun');

describe('Email chain', () => {
  it('should return default', () => {
    const inst = mailer();
    expect(inst.src).toEqual(expect.any(Function));
    expect(inst.data).toMatchObject({
      companyName: '3merge Inc',
    });
  });

  it('should override default', () => {
    mailer.config({
      companyName: 'Hooli',
    });
    expect(mailer().data).toMatchObject({
      companyName: 'Hooli',
    });
  });

  it('should throw an error', () => {
    expect(() => mailer('unknown')).toThrowError();
  });

  it('should fail with invalid email', () => {
    expect(() => mailer().to()).toThrowError();
    expect(() =>
      mailer().setRecipients(['mibb']),
    ).toThrowError();
  });

  it('should configure email meta', async () => {
    const args = {
      title: 'Password reset',
      body:
        'You have requested a new password. If this was done without your consent, please immediately reach out to support.',
      signature: 'Cheers',
      url: 'https://google.ca',
      button: 'Read more',
      smallPrint: 'This is important to read',
      rows: [
        {
          label: 'Username',
          value: 'mibby92',
        },
      ],
    };

    mailer.config({
      logo:
        'https://placeholder.com/wp-content/uploads/2018/10/placeholder.com-logo1.png',
      companyName: 'Hooli',
      color: 'ffc107',
    });

    const msg = mailer()
      .to(['foo@bar.ca', 'quuz@baz.com'])
      .subject('Hey there!')
      .props(args);

    expect(msg.meta.to).toBe('foo@bar.ca, quuz@baz.com');
    expect(msg.meta.subject).toMatch('Hey there!');
    expect(msg.data).toMatchObject(args);

    await msg.send();
  });
});
