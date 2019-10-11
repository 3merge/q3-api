const { model } = require('q3-api');
const { compose, check } = require('q3-core-composer');

const Download = async ({ params: { fileID } }, res) => {
  const url = await model('Q3Files').findSignedById(fileID);
  res.ok({
    url,
  });
};

Download.validation = [
  check('fileID')
    .isMongoId()
    .withMessage((v, { req }) =>
      req.t('validations:mongoId', {
        id: v,
      }),
    ),
];

module.exports = compose(Download);
