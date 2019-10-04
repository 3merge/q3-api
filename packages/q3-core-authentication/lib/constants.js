const { exception } = require('q3-api');

module.exports = {
  MODEL_NAME: 'q3-users',

  matchWithConfirmation: (value, { req }) => {
    if (value !== req.body.confirmNewPassword)
      exception('ValidationError').throw(
        req.translate('validations:confirmationPassword'),
      );

    return value;
  },
};
