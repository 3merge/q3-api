const { compose, check } = require('q3-core-composer');
const aws = require('../../config/aws');
const mongoose = require('../../config/mongoose');

const S3UploadPost = async (
    req,
    res,
) => {
    const {
        collection,
        id,
        mimetype,
        name,
    } = req.body;

    (
        // checks the doc exists
        await mongoose.model(collection).findStrictly(id)
        // checks the user can upload to this document eventually
    ).checkAuthorizationForTotalSubDocument('uploads', 'Create');

    res.create({
        url: aws().getSignedUrl(`${id}/${name}`, mimetype),
    });
};

S3UploadPost.validation = [
    check('collection').isString(),
    check('id').isString(),
    check('name').isString(),
    check('mimetype').isString(),
];

module.exports = compose(S3UploadPost);

