const {
  compose,
  check,
  verify,
} = require('q3-core-composer');
const { emit } = require('q3-core-mailer');
const { exception } = require('q3-core-responder');
const { Users } = require('../../models');

const updatePassword = async ({ body, user }, res) => {
  const { previousPassword, newPassword } = body;
  const doc = await Users.findVerifiedById(user.id);
  await doc.verifyPassword(previousPassword, true);
  await doc.setPassword(newPassword);

  emit('onPasswordChange', doc.toJSON());
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

updatePassword.authorization = [verify];
module.exports = compose(updatePassword);
