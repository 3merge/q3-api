const { compose, check } = require('q3-core-composer');
const { get } = require('lodash');
const { exception } = require('q3-core-responder');
const { emit } = require('q3-core-mailer');
const {
  generateIDToken,
} = require('q3-schema-users/lib/helpers');
const { Users } = require('../../models');
const { checkEmail } = require('../../utils');

const getDeviceInfo = (useragent, user) => {
  try {
    const source = get(useragent, 'source', null);

    if (!source || get(user, 'source', []).includes(source))
      throw new Error(
        'Device info not available or applicable',
      );

    emit('onNewDevice', {
      useragent,
      user,
    });

    return {
      $addToSet: {
        source,
      },
    };
  } catch (e) {
    return {};
  }
};

const LoginIntoAccount = async (
  {
    body: { email, password },
    headers: { host },
    useragent,
  },
  res,
) => {
  const userResult = await Users.findVerifiedByEmail(email);
  if (!userResult.isPermitted)
    exception('Authorization').msg('prohibited').throw();

  await userResult.verifyPassword(password, true);

  const { _id: id, secret } = userResult;
  const tokens = await generateIDToken(id, secret, host);

  await userResult.update({
    lastLoggedIn: new Date(),
    ...getDeviceInfo(useragent, userResult),
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
