const { model } = require('q3-api');
const { compose, check } = require('q3-core-composer');

const DeleteFile = async (
  { params: { fileID }, t },
  res,
) => {
  await model('Q3Files').archive(fileID);
  res.acknowledge({
    message: t('messages:fileArchived'),
  });
};

DeleteFile.validation = [
  check('fileID')
    .isMongoId()
    .withMessage((v, { req: { t } }) =>
      t('validations:mongoId', {
        id: v,
      }),
    ),
];

module.exports = compose(DeleteFile);
