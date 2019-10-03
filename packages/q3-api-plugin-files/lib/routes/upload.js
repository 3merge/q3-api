const Q3 = require('q3-api');
const {
  check,
  sanitizeBody,
} = require('express-validator');

const Upload = async ({ body, translate }, res) => {
  const docs = await Q3.model('Q3Files').upload(body);
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
      req.translate('validations:mongoId'),
    ),
  check('model')
    .isString()
    .withMessage((v, { req }) =>
      req.translate('validations:model'),
    ),
  check('name')
    .isString()
    .optional()
    .withMessage((v, { req }) =>
      req.translate('validations:name'),
    ),
  check('sensitive')
    .isBoolean()
    .withMessage((v, { req }) =>
      req.translate('validations:sensitive'),
    ),
  sanitizeBody('sensitive').toBoolean(),
  check('files').custom((v, { req }) => {
    if (!v || !Object.keys(v).length)
      throw new Error(req.translate('validations:files'));

    return true;
  }),
];

module.exports = Q3.define(Upload);
