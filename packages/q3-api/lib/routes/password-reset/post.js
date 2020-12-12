const { compose } = require('q3-core-composer');
const { queue } = require('q3-core-scheduler');
const { Users } = require('../../models');
const { checkEmail } = require('../../utils');

const resetPassword = async ({ body, t }, res) => {
  try {
    const doc = await Users.findVerifiedByEmail(body.email);
    await doc.setPasswordResetToken();
    await doc.save();
    await queue('onPasswordReset', doc);
  } catch (err) {
    // noop
  } finally {
    res.ok({
      message: t('messages:ifEmailExists'),
    });
  }
};

resetPassword.validation = [checkEmail];

const Ctrl = compose(resetPassword);
Ctrl.$og = resetPassword;

module.exports = Ctrl;
