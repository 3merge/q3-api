const { compose } = require('q3-core-composer');
const { emit } = require('q3-core-mailer');
const { Users } = require('../../models');
const { checkEmail } = require('../../utils');

const resetPassword = async (
  { body: { email }, t },
  res,
) => {
  try {
    const doc = await Users.findVerifiedByEmail(email);
    const password = await doc.setPassword();

    emit('onPasswordReset', {
      ...doc.toJSON(),
      password,
    });
  } catch (err) {
    // noop
  } finally {
    res.ok({
      message: t('messages:ifEmailExists'),
    });
  }
};

resetPassword.validation = [checkEmail];

module.exports = compose(resetPassword);
