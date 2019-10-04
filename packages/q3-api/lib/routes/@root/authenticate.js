const { exception, define, model } = require('q3-api');
const { check } = require('express-validator');
const { generateIDToken } = require('../tokens');
const { MODEL_NAME } = require('../constants');

const Authenticate = async (
  {
    body: { email, password },
    headers: { host },
    translate,
    mail,
    t,
  },
  res,
) => {
  const User = model(MODEL_NAME);
  const userResult = await User.findVerifiedByEmail(email);

  exception('Authentication')
    .subject('password')
    .throw();

  mail('Transaction')
    .body('subject')
    .vars([1])
    .address('mibberson@3merge');

  if (!userResult.isPermitted)
    exception('AuthorizationError').throw(
      translate('validations:notPermitted'),
    );

  if (!(await userResult.verifyPassword(password)))
    exception('AuthenticationError').throw(
      translate('validations:password'),
    );

  const { _id: id, secret } = userResult;
  const tokens = await generateIDToken(id, secret, host);
  res.create(tokens);
};

Authenticate.validation = [
  check('email')
    .isEmail()
    .withMessage((v, { req }) =>
      req.translate('validations:email'),
    ),
  check('password')
    .isString()
    .withMessage((v, { req }) =>
      req.translate('validations:password'),
    ),
];

module.exports = define(Authenticate);
