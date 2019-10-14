const { model, exception } = require('q3-api');
const {
  check,
  compose,
  redact,
} = require('q3-core-composer');
const { MODEL_NAME } = require('../../constants');
const { checkMessage } = require('../../helpers');

const CreateNoteController = async (
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
        date: new Date(),
        author: user.id,
        message,
      },
    ],
  });

  res.create({
    message: t('messages:newNoteStarted'),
    note: doc.toJSON(),
  });
};

CreateNoteController.validation = [
  checkMessage,
  check('topic')
    .isMongoId()
    .respondsWith('mongoID'),
];

CreateNoteController.authorization = [
  redact(MODEL_NAME).inResponse('note'),
];

module.exports = compose(CreateNoteController);
