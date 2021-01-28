/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();

const Mailer = require('q3-core-mailer');

describe('Mailer', () => {
  it('should send an email', async () => {
    process.env.MAILGUN_DEBUG = true;

    expect(
      Mailer('test')
        .to(['mibberson@3merge.ca'])
        .subject('My first email')
        .props({ name: 'Ben' })
        .send(),
    ).resolves.toBeUndefined();
  });
});
