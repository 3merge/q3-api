const { compose } = require('q3-core-composer');
const { queue } = require('q3-core-scheduler');
const { Users } = require('../../models');
const { checkEmail } = require('../../utils');

const ResetPasswordController = async (
  { body: { email }, t },
  res,
) => {
  try {
    const doc = await Users.issuePasswordResetToken(email);
    await queue('onPasswordReset', doc);
  } catch (err) {
    // noop
  } finally {
    res.ok({
      message: t('messages:ifEmailExists'),
    });
  }
};

ResetPasswordController.validation = [checkEmail];

const Ctrl = compose(ResetPasswordController);
Ctrl.$og = ResetPasswordController;

module.exports = Ctrl;
