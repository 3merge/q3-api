const { compose } = require('q3-core-composer');
const emitter = require('../../events/emitter');
const { Users } = require('../../models');
const { checkEmail } = require('../../helpers/validation');

const resetPassword = async (
  { body: { email }, t },
  res,
) => {
  try {
    const doc = await Users.findVerifiedByEmail(email);
    const password = await doc.setPassword();

    emitter.emit('onPasswordReset', {
      ...doc,
      email,
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
