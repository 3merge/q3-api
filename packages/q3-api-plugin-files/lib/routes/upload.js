const { model } = require('q3-api');
const {
  check,
  sanitizeBody,
  compose,
} = require('q3-core-composer');

const Upload = async ({ body, translate }, res) => {
  const docs = await model('Q3Files').upload(body);
  res.create({
    files: docs.map((obj) =>
      obj.toJSON({ virtuals: true }),
    ),
    message: translate('messages:fileUpload', [
      docs.length,
    ]),
  });
};

Upload.validation = [
  check('topic')
    .isMongoId()
    .withMessage((v, { req }) =>
      req.t('validations:mongoId'),
    ),
  check('model')
    .isString()
    .withMessage((v, { req }) =>
      req.t('validations:model'),
    ),
  check('name')
    .isString()
    .optional()
    .withMessage((v, { req }) => req.t('validations:name')),
  check('sensitive')
    .isBoolean()
    .withMessage((v, { req }) =>
      req.t('validations:sensitive'),
    ),
  sanitizeBody('sensitive').toBoolean(),
  check('files').custom((v, { req }) => {
    if (!v || !Object.keys(v).length)
      throw new Error(req.t('validations:files'));

    return true;
  }),
];

module.exports = compose(Upload);
