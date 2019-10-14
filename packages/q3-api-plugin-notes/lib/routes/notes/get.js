const { model } = require('q3-api');
const { compose, redact } = require('q3-core-composer');
const { MODEL_NAME } = require('../../constants');

const GetByInvolvementController = async (
  { user },
  res,
) => {
  const docs = await model(MODEL_NAME)
    .find({
      $or: [
        { subscribers: { $in: [user._id] } },
        { 'thread.author': user._id },
      ],
    })
    .sort({
      updatedAt: 1,
    });

  res.ok({
    notes: docs.map((doc) => doc.toJSON()),
  });
};

GetByInvolvementController.validation = [];
GetByInvolvementController.authorization = [
  redact(MODEL_NAME).inResponse('notes'),
];

module.exports = compose(GetByInvolvementController);
