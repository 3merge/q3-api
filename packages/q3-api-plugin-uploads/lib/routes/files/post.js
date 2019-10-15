const { model } = require('q3-api');
const {
  check,
  sanitizeBody,
  compose,
} = require('q3-core-composer');
const { MODEL_NAME } = require('../../constants');

const Upload = async ({ body, t }, res) => {
  const docs = await model(MODEL_NAME).upload(body);
  res.create({
    files: docs.map((obj) => obj.toJSON()),
    message: t('messages:fileUpload', [docs.length]),
  });
};

Upload.validation = [
  check('topic')
    .isMongoId()
    .respondsWith('mongoID'),
  check('model')
    .isString()
    .respondsWith('required'),
  check('name')
    .isString()
    .respondsWith('string')
    .optional(),
  check('sensitive')
    .respondsWith('boolean')
    .isBoolean(),
  sanitizeBody('sensitive').toBoolean(),
  check('files').custom((v, { req }) => {
    if (!v || !Object.keys(v).length)
      throw new Error(req.t('validations:files'));

    return true;
  }),
];

module.exports = compose(Upload);
