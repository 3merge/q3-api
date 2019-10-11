import { compose, check, verify } from 'q3-core-composer';
import mailer from 'q3-core-mailer';
import { Users } from '../../models';
import exception from '../../errors';

const updatePassword = async (
  { body, user, evoke },
  res,
) => {
  const { previousPassword, newPassword } = body;
  const doc = await Users.findVerifiedById(user.id);
  await doc.verifyPassword(previousPassword, true);
  await doc.setPassword(newPassword);
  evoke({
    to: doc.email,
    name: doc.firstName,
  });

  res.acknowledge();
};

updatePassword.validation = [
  check('previousPassword')
    .isString()
    .withMessage((v, { req }) =>
      req.t.val('previousPassword'),
    ),
  check('newPassword')
    .isString()
    .custom((value, { req }) => {
      if (value !== req.body.confirmNewPassword)
        exception('Validation')
          .field('confirmNewPassword')
          .throw();

      return value;
    })
    .withMessage((v, { req }) => req.t.val('newPassword')),
];

const onPasswordUpdate = async ({ to, name }, { t }) => {
  const subject = t('messages:passwordUpdate');
  const body = t('messages:passwordUpdateNotification');
  const title = t('messages:greetings', {
    name,
  });

  return mailer()
    .to([to])
    .subject(subject)
    .props({
      title,
      body,
    })
    .send();
};

updatePassword.authorization = [verify()];
updatePassword.effect = [onPasswordUpdate];

module.exports = compose(updatePassword);
