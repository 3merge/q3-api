const { compose } = require('q3-core-composer');
const mailer = require('q3-core-mailer');
const { Users } = require('../../models');
const { checkEmail } = require('../../helpers/validation');

const resetPassword = async (
  { body: { email }, evoke, hostname, t },
  res,
) => {
  try {
    const doc = await Users.findVerifiedByEmail(email);
    const password = await doc.setPassword();
    evoke({
      url: `https://${hostname}.com/login`,
      name: doc.firstName,
      to: email,
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

const emailTemporaryPassword = async (
  { name, to, password, url },
  { t },
) => {
  const subject = t('messages:passwordReset');
  const body = t('messages:temporaryPassword');
  const button = t('labels:login');
  const title = t('messages:greetings', {
    name,
  });

  const rows = [
    {
      label: t('labels:temporaryPassword'),
      value: `"${password}"`,
    },
  ];

  return mailer()
    .to([to])
    .subject(subject)
    .props({
      title,
      body,
      button,
      url,
      rows,
    })
    .send();
};

resetPassword.validation = [checkEmail];
resetPassword.effect = [emailTemporaryPassword];

module.exports = compose(resetPassword);
