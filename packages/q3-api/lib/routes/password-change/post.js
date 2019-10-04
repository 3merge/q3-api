import { compose, check, verify } from 'q3-core-composer';
import { Users } from '../../models';
import exception from '../../errors';
import mail from '../../config/mailer';

const updatePassword = async (
  { body, user, evoke },
  res,
) => {
  const { previousPassword, newPassword } = body;
  const doc = await Users.findVerifiedById(user.id);
  await doc.verifyPassword(previousPassword, true);
  await doc.setPassword(newPassword);
  evoke({ to: doc.email });
  res.acknowledge();
};

updatePassword.validation = [
  check('previousPassword')
    .isString()
    .withMessage((v, { req }) =>
      req.translate('validations:password'),
    ),
  check('newPassword')
    .isString()
    .custom((value, { req }) => {
      if (value !== req.body.confirmNewPassword)
        exception('Validation')
          .msg(req.t('validations:confirmationPassword'))
          .throw();

      return value;
    })
    .withMessage((v, { req }) =>
      req.t('validations:confirmationPassword'),
    ),
];

updatePassword.authorization = [verify()];

updatePassword.effect = [
  ({ to }, { t }) => {
    mail(to, t('messages:passwordUpdated'));
  },
];

module.exports = compose(updatePassword);
