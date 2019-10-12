const { model } = require('q3-api');
const { compose } = require('q3-core-composer');
const { MODEL_NAME } = require('../../constants');

const ListByInvolvement = async ({ user }, res) => {
  const docs = await model(MODEL_NAME)
    .find({
      $or: [
        { subscribers: { $in: [user.id] } },
        { 'thread.author': user.id },
      ],
    })
    .sort({
      updatedAt: 1,
    });

  res.ok({
    notes: docs.map((doc) =>
      doc.toJSON({
        virtuals: true,
      }),
    ),
  });
};

ListByInvolvement.validation = [];

module.exports = compose(ListByInvolvement);
