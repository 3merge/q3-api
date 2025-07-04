const { compose, check } = require('q3-core-composer');
const path = require('path');
const { exception } = require('q3-core-responder');
const mongoose = require('../../config/mongoose');

const S3UploadTransferPost = async (req, res) => {
  const { collection, id, name, size } = req.body;

  if (!path.extname(name)) {
    exception('Validation')
      .msg('missingFileExtension')
      .field('name')
      .throw();
  }

  const model = mongoose.model(collection);
  const doc = await model.findStrictly(id, {
    select: '+uploads',
  });

  doc.checkAuthorizationForTotalSubDocument(
    'uploads',
    'Create',
  );
  await doc.handleIndirectFile(name, size);

  res.create({
    message: 'newSubResourceAdded',
    uploads: doc.uploads,
  });
};

S3UploadTransferPost.validation = [
  check('collection').isString(),
  check('id').isString(),
  check('name').isString(),
  check('size').isNumeric(),
];

module.exports = compose(S3UploadTransferPost);
