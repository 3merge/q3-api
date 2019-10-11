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
  evoke({ to: doc.email });
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
    .withMessage((v, { req }) =>
      req.t.val('newPassword', [v]),
    ),
];

updatePassword.authorization = [verify()];

updatePassword.effect = [
  async ({ to }, { t }) =>
    mailer()
      .setRecipients([to])
      .setSubject(t.val('passwordUpdated'))
      .setProps({
        title: t.val('passwordUpdatedTitle'),
        body: t.val('passwordUpdatedBody'),
      })
      .send(),
];

module.exports = compose(updatePassword);
