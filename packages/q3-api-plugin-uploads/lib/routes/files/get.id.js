const { model } = require('q3-api');
const {
  compose,
  check,
  redact,
} = require('q3-core-composer');
const { MODEL_NAME } = require('../../constants');

const GetFileController = async (
  { params: { fileID } },
  res,
) => {
  const url = await model(MODEL_NAME).findSignedById(
    fileID,
  );
  res.ok({
    url,
  });
};

GetFileController.authorization = [redact(MODEL_NAME)];

GetFileController.validation = [
  check('fileID')
    .isMongoId()
    .respondsWith('mongodID'),
];

module.exports = compose(GetFileController);
