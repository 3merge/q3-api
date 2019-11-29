const { compose, check } = require('q3-core-composer');
const { exception } = require('q3-core-responder');
const {
  generateIDToken,
} = require('q3-schema-users/lib/helpers');
const { Users } = require('../../models');
const { checkEmail } = require('../../utils');

const LoginIntoAccount = async (
  { body: { email, password }, headers: { host } },
  res,
) => {
  const userResult = await Users.findVerifiedByEmail(email);
  if (!userResult.isPermitted)
    exception('Authorization')
      .msg('prohibited')
      .throw();

  await userResult.verifyPassword(password, true);

  const { _id: id, secret } = userResult;
  const tokens = await generateIDToken(id, secret, host);
  res.create(tokens);
};

LoginIntoAccount.validation = [
  checkEmail,
  check('password')
    .isString()
    .withMessage((v, { req }) =>
      req.t.val('password', [v]),
    ),
];

module.exports = compose(LoginIntoAccount);
