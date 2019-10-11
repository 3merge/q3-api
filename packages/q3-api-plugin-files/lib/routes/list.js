const { model } = require('q3-api');
const {
  check,
  sanitizeBody,
  compose,
  verify,
} = require('q3-core-composer');

const List = async ({ body }, res) => {
  const docs = await model('Q3Files').findByTopic(body);
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
      req.t('validations:mongoId'),
    ),
  check('sensitive')
    .isBoolean()
    .withMessage((v, { req }) =>
      req.t('validations:sensitive'),
    ),
  sanitizeBody('sensitive').toBoolean(),
];

List.authorization = [verify()];
module.exports = compose(List);
