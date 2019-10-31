const { check } = require('q3-core-composer');
const exception = require('../errors');

module.exports.checkMsg = (v, { req, path }) =>
  req.t.val(path, [v]);

module.exports.checkEmail = check('email')
  .isEmail()
  .withMessage((v, { req }) => req.dirty('email'));

module.exports.checkNewPassword = check('newPassword')
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

module.exports.reportMongoId = (v, { req }) =>
  req.t.val('mongo', [v]);
