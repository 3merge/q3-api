const { check } = require('express-validator');

module.exports = {
  checkMessage: check('message')
    .isString()
    .withMessage((v, { req }) =>
      req.translate('validations:required'),
    ),
  checkNoteID: check('noteID')
    .isMongoId()
    .withMessage((v, { req }) =>
      req.translate('validations:mongoID', [v]),
    ),
  checkThreadID: check('threadID')
    .isMongoId()
    .withMessage((v, { req }) =>
      req.translate('validations:mongoID', [v]),
    ),
};
