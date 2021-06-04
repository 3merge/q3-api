const { compose, check } = require('q3-core-composer');
const { checkEmail } = require('../../utils');
const auth = require('../../auth');

const LoginIntoAccount = async (
  {
    body: { email, password },
    headers: { host },
    useragent,
  },
  res,
) => {
  const authInstance = await auth(email);
  authInstance.checkPassword(password);

  const missingVerification =
    authInstance.checkVerification();

  if (missingVerification) {
    res.ok(missingVerification);
  } else {
    await authInstance.trackDevice(useragent);
    res.create(await authInstance.makeToken(host));
  }
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
