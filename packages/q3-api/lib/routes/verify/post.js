const { check, compose } = require('q3-core-composer');
const { exception } = require('q3-core-responder');
const {
  checkNewPassword,
} = require('../../helpers/validation');
const { Users } = require('../../models');

const verify = async (
  { body: { id, password, verificationCode } },
  res,
) => {
  const doc = await Users.findUserBySecret(
    id,
    verificationCode,
  );

  if (doc.hasExpired)
    exception('Conflict')
      .msg('expired')
      .field('verificationCode')
      .throw();

  await doc.setPassword(password);
  res.acknowledge();
};

verify.validation = [
  checkNewPassword,
  check('id')
    .isMongoId()
    .respondsWith('mongoID'),
  check('verificationCode')
    .isString()
    .respondsWith('verificationCode'),
];

module.exports = compose(verify);
