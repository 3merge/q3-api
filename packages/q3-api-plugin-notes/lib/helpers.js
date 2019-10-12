const { check } = require('q3-core-composer');

module.exports = {
  checkMessage: check('message')
    .isString()
    .withMessage((v, { req }) =>
      req.t('validations:required'),
    ),
  checkNoteID: check('notesID')
    .isMongoId()
    .withMessage((v, { req }) =>
      req.t('validations:mongoID', [v]),
    ),
  checkThreadID: check('threadsID')
    .isMongoId()
    .withMessage((v, { req }) =>
      req.t('validations:mongoID', [v]),
    ),
};
