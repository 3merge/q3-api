const Q3 = require('q3-api');
const { check } = require('express-validator');
const { MODEL_NAME } = require('../constants');
const { checkMessage } = require('./helpers');

const CreateNote = async (
  { body: { topic, message }, translate, user },
  res,
) => {
  const Model = Q3.model(MODEL_NAME);
  if (await Model.countDocuments({ topic }))
    Q3.exception('ConflictError').throw(
      translate('messages:topicExists'),
    );

  const doc = await Model.create({
    topic,
    subscribers: [user.id],
    thread: [
      {
        author: user.id,
        message,
      },
    ],
  });
  res.create({
    message: translate('messages:newNoteStarted'),
    note: doc.toJSON({
      virtuals: true,
    }),
  });
};

CreateNote.validation = [
  checkMessage,
  check('topic')
    .isMongoId()
    .withMessage((v, { req }) =>
      req.translate('validations:mongoID', [v]),
    ),
];

module.exports = Q3.define(CreateNote);
