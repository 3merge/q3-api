/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();

const path = require('path');
const Mailer = require('q3-core-mailer');
const onTest = require('../fixtures/events/onTest');

describe('Mailer', () => {
  beforeAll(() => {
    Mailer.discover(
      path.resolve(__dirname, '../fixtures/events'),
    );
  });

  it('should register an event by filesystem', () => {
    expect(Mailer.get()).toHaveLength(1);
  });

  it('should emit a registered event', () => {
    Mailer.emit('onTest', { foo: 1 });
    expect(onTest).toHaveBeenCalled();
  });

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
