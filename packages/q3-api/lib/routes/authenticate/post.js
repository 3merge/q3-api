const { compose, check } = require('q3-core-composer');
const {
  generateIDToken,
} = require('../../models/user/helpers');
const { Users } = require('../../models');
const exception = require('../../errors');
const { checkEmail } = require('../../helpers/validation');

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
