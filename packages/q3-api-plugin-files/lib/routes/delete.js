const Q3 = require('q3-api').default;
const { check } = require('express-validator');

const DeleteFile = async (
  { params: { fileID }, translate },
  res,
) => {
  await Q3.model('Q3Files').archive(fileID);
  res.acknowledge({
    message: translate('messages:fileArchived'),
  });
};

DeleteFile.validation = [
  check('fileID')
    .isMongoId()
    .withMessage((v, { req }) =>
      req.translate('validations:mongoId'),
    ),
];

module.exports = Q3.define(DeleteFile);
