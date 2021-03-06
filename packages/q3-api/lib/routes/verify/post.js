const { check, compose } = require('q3-core-composer');
const { exception } = require('q3-core-responder');
const { queue } = require('q3-core-scheduler');
const { checkNewPassword } = require('../../utils');
const { Users } = require('../../models');

const verify = async (
  { body: { id, newPassword, verificationCode } },
  res,
) => {
  const doc = await Users.findUserBySecret(
    id,
    verificationCode,
  );

  if (doc.verified)
    exception('Conflict')
      .msg('alreadyVerified')
      .field('id')
      .throw();

  if (doc.hasExpired)
    exception('Gone')
      .msg('expired')
      .field('verificationCode')
      .throw();

  await doc.setPassword(newPassword);
  await queue('onVerify', doc);
  res.acknowledge();
};

verify.validation = [
  checkNewPassword,
  check('id').isMongoId().respondsWith('mongoID'),
  check('verificationCode')
    .isString()
    .respondsWith('verificationCode'),
];

module.exports = compose(verify);
