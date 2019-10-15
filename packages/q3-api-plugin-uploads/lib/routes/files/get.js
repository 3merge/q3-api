const { model } = require('q3-api');
const {
  check,
  sanitizeBody,
  compose,
  redact,
} = require('q3-core-composer');
const { MODEL_NAME } = require('../../constants');

const GetAllFiles = async ({ body }, res) => {
  const docs = await model(MODEL_NAME).findByTopic(body);
  res.ok({
    files: docs.map((doc) => doc.toJSON()),
  });
};

GetAllFiles.validation = [
  check('topic')
    .isMongoId()
    .respondsWith('mongoID'),
  check('sensitive')
    .isBoolean()
    .respondsWith('sensitive'),
  sanitizeBody('sensitive').toBoolean(),
];

GetAllFiles.authorization = [redact(MODEL_NAME)];
module.exports = compose(GetAllFiles);
