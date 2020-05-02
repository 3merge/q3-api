const Q3 = require('q3-api');
const moment = require('moment');
const supertest = require('supertest');
const mongoose = require('mongoose');
const { hasEventBeenCalled } = require('../helpers');
const { genUser } = require('../fixtures');

let agent;
let user;

beforeAll(async () => {
  Q3.routes();
  await Q3.connect();

  agent = supertest(Q3.$app);
  user = await genUser();
});

afterAll(async () => {
  await mongoose.disconnect();
});

const verificationCode = 'Shh!';

const getActiveSecret = () => ({
  secretIssuedOn: moment().subtract('1', 'day'),
  secret: verificationCode,
});

const getExpiredSecret = () => ({
  secretIssuedOn: moment().subtract('1', 'week'),
  secret: verificationCode,
});

const getStrongPasswordPair = () => ({
  newPassword: 'Strong!12',
  confirmNewPassword: 'Strong!12',
});

const getVerificationPayload = (rest) => ({
  id: user.id,
  verificationCode,
  ...getStrongPasswordPair(),
  ...rest,
});

describe('User authentication flow', () => {
  describe('/reverify', () => {
    it('should fail with an unknown email', () =>
      agent
        .post('/reverify')
        .send(
          getVerificationPayload({
            email: 'foo@bar.com',
          }),
        )
        .expect(400));

    it('should succeed with a known email', async () => {
      const confirm = hasEventBeenCalled('onReverify');
      await agent
        .post('/reverify')
        .send(
          getVerificationPayload({
            email: user.email,
          }),
        )
        .expect(204);

      return confirm();
    });
  });

  describe('/verify', () => {
    beforeAll(async () => {
      await user.update(getExpiredSecret());
    });

    it('should fail without a verification token', () =>
      agent
        .post('/verify')
        .send(
          getVerificationPayload({
            verificationCode: 'Noop',
          }),
        )
        .expect(400));

    it('should fail with an expired verification', () =>
      agent
        .post('/verify')
        .send(getVerificationPayload())
        .expect(410));

    it('should succeed with a fresh token', async () => {
      const confirm = hasEventBeenCalled('onVerify');
      await user.update(getActiveSecret());
      await agent
        .post('/verify')
        .send(getVerificationPayload())
        .expect(204);

      return confirm();
    });

    it('should fail if already verified', () =>
      agent
        .post('/verify')
        .send(getVerificationPayload())
        .expect(409));

    it('should fail to re-verify afterwards', () =>
      agent
        .post('/reverify')
        .send(
          getVerificationPayload({
            email: user.email,
          }),
        )
        .expect(400));
  });
});
