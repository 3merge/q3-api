const { check } = require('q3-core-composer');
const { exception } = require('q3-core-responder');

const checkMsg = (v, { req, path }) => req.t.val(path, [v]);

const checkEmail = check('email')
  .isEmail()
  .withMessage((v, { req }) =>
    req.t('validations:isEmail'),
  );

const checkNewPassword = check('newPassword')
  .isString()
  .custom((value, { req }) => {
    if (value !== req.body.confirmNewPassword)
      exception('Validation')
        .field('confirmNewPassword')
        .throw();

    return value;
  })
  .withMessage((v, { req }) =>
    req.t('validations:newPassword'),
  );

const reportMongoId = (v, { req }) =>
  req.t('validations:mongo', [v]);

module.exports = {
  checkNewPassword,
  checkMsg,
  checkEmail,
  check,
  reportMongoId,
};
