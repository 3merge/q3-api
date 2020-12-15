const Q3 = require('q3-api');
const moment = require('moment');
const { on } = require('q3-core-scheduler');
const {
  hasEventBeenCalled,
  teardown,
} = require('../helpers');
const setup = require('../fixtures');

let agent;
let user;

beforeAll(async () => {
  ({ user, agent } = await setup());

  // make this user non-verified
  await user.update({
    verified: false,
    password: undefined,
  });
});

afterAll(teardown);

const verificationCode = 'Shh!';
const newPassword = 'Strong!12';

const getActiveSecret = () => ({
  secretIssuedOn: moment().subtract('1', 'day'),
  secret: verificationCode,
});

const getExpiredSecret = () => ({
  secretIssuedOn: moment().subtract('1', 'week'),
  secret: verificationCode,
});

const getStrongPasswordPair = () => ({
  confirmNewPassword: 'Strong!12',
  newPassword,
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

  describe('/password-reset', () => {
    it('should issue a token', async () => {
      const confirm = hasEventBeenCalled('onPasswordReset');
      await agent
        .post('/password-reset')
        .send({
          email: user.email,
        })
        .expect(200);

      return confirm();
    });

    describe('/password-change', () => {
      let passwordResetToken;
      const confirmNewPassword = 'N3tN2w!123';

      beforeAll(async () => {
        ({ passwordResetToken } = await Q3.Users.findById(
          user.id,
        )
          .lean()
          .exec());
      });

      it('should fail if used previously', async () =>
        agent
          .post('/password-change')
          .send({
            email: user.email,
            passwordResetToken,
            confirmNewPassword: newPassword,
            newPassword,
          })
          .expect(422));

      it('should change the password', async () => {
        const confirm = hasEventBeenCalled(
          'onPasswordChange',
        );

        await agent
          .post('/password-change')
          .send({
            email: user.email,
            passwordResetToken,
            newPassword: confirmNewPassword,
            confirmNewPassword,
          })
          .expect(204);

        return confirm();
      });

      it.skip('should fail to change the password', async () => {
        const { body } = await agent
          .post('/authenticate')
          .send({
            email: user.email,
            password: confirmNewPassword,
          });

        await agent
          .post('/password-change')
          .set({
            Authorization: `Bearer ${body.token}`,
            'X-Session-Nonce': body.nonce,
          })
          .send({
            previousPassword: confirmNewPassword,
            newPassword: confirmNewPassword,
            confirmNewPassword,
          })
          .expect(422);
      });

      it('should block previous password without logging in', async () => {
        await agent
          .post('/password-change')
          .send({
            previousPassword: confirmNewPassword,
            newPassword: confirmNewPassword,
            confirmNewPassword,
          })
          .expect(401);
      });
    });

    describe('/authenticate', () => {
      it.skip('should alert on new sign-in', async () => {
        const confirm = hasEventBeenCalled('onNewDevice');
        const confirmNewPassword = 'N3tN2w!123';

        const { body } = await agent
          .post('/authenticate')
          .send({
            email: user.email,
            password: confirmNewPassword,
          })
          .expect(201);

        expect(body).toHaveProperty('token');
        expect(body).toHaveProperty('nonce');
        return confirm();
      });
    });
  });
});
