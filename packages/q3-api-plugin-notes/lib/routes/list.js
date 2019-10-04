const Q3 = require('q3-api');
const { MODEL_NAME } = require('../constants');

const ListByInvolvement = async ({ user }, res) => {
  const docs = await Q3.model(MODEL_NAME)
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

module.exports = Q3.define(ListByInvolvement);
