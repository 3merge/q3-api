const Q3 = require('q3-api').default;
const {
  check,
  sanitizeBody,
} = require('express-validator');

const List = async ({ body }, res) => {
  const docs = await Q3.model('Q3Files').findByTopic(body);
  res.ok({
    files: docs.map((doc) =>
      doc.toJSON({ virtuals: true }),
    ),
  });
};

List.validation = [
  check('topic')
    .isMongoId()
    .withMessage((v, { req }) =>
      req.translate('validations:mongoId'),
    ),
  check('sensitive')
    .isBoolean()
    .withMessage((v, { req }) =>
      req.translate('validations:sensitive'),
    ),
  sanitizeBody('sensitive').toBoolean(),
];

module.exports = Q3.define(List);
