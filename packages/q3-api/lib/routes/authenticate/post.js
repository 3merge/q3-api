const { compose, check } = require('q3-core-composer');
const { checkEmail } = require('../../utils');
const { Users } = require('../../models');

const LoginIntoAccount = async (
  {
    body: { email, password },
    headers: { host },
    useragent,
  },
  res,
) => {
  const tokens = await Users.login(email, password, {
    useragent,
    host,
  });

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
