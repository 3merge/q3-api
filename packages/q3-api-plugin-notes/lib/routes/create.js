const { model, exception } = require('q3-api');
const { check, compose } = require('q3-core-composer');
const { MODEL_NAME } = require('../constants');
const { checkMessage } = require('./helpers');

const CreateNote = async (
  { body: { topic, message }, t, user },
  res,
) => {
  const Model = model(MODEL_NAME);
  if (await Model.countDocuments({ topic }))
    exception('ConflictError')
      .msg('topicExists')
      .throw();

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
    message: t('messages:newNoteStarted'),
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
      req.t('validations:mongoID', [v]),
    ),
];

module.exports = compose(CreateNote);
