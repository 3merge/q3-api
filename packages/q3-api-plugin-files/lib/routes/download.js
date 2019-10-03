const Q3 = require('q3-api');
const { check } = require('express-validator');

const Download = async ({ params: { fileID } }, res) => {
  const url = await Q3.model('Q3Files').findSignedById(
    fileID,
  );
  res.ok({
    url,
  });
};

Download.validation = [
  check('fileID')
    .isMongoId()
    .withMessage((v, { req }) =>
      req.translate('validations:mongoId'),
    ),
];

module.exports = Q3.define(Download);
