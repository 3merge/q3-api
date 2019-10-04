const { compose, check } = require('q3-core-composer');
const {
  generateIDToken,
} = require('../../models/user/helpers');
const { Users } = require('../../models');
const exception = require('../../errors');

const loginIntoAccount = async (
  { body: { email, password }, headers: { host }, t },
  res,
) => {
  const userResult = await Users.findVerifiedByEmail(email);

  if (!userResult.isPermitted)
    exception('Authorization')
      .msg(t('validations:notPermitted'))
      .throw();

  if (!(await userResult.verifyPassword(password)))
    exception('Authentication')
      .msg(t('validations:password'))
      .throw();

  const { _id: id, secret } = userResult;
  const tokens = await generateIDToken(id, secret, host);
  res.create(tokens);
};

loginIntoAccount.validation = [
  check('email')
    .isEmail()
    .withMessage((v, { req }) =>
      req.t('validations:email'),
    ),
  check('password')
    .isString()
    .withMessage((v, { req }) =>
      req.t('validations:password'),
    ),
];

module.exports = compose(loginIntoAccount);
