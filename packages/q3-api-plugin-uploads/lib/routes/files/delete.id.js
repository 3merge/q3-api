const { model } = require('q3-api');
const {
  compose,
  check,
  redact,
} = require('q3-core-composer');
const { MODEL_NAME } = require('../../constants');

const DeleteFileController = async (
  { params: { fileID }, t },
  res,
) => {
  await model(MODEL_NAME).archive(fileID);
  res.acknowledge({
    message: t('messages:fileArchived'),
  });
};

DeleteFileController.authorization = [redact(MODEL_NAME)];

DeleteFileController.validation = [
  check('fileID')
    .isMongoId()
    .respondsWith('mongoId'),
];

module.exports = compose(DeleteFileController);
