const { model } = require('q3-api');
const { compose, redact } = require('q3-core-composer');
const mailer = require('q3-core-mailer');
const { MODEL_NAME } = require('../../../constants');
const {
  checkMessage,
  checkNoteID,
} = require('../../../helpers');

const AddToThreadController = async (
  {
    params: { notesID },
    body: { message },
    t,
    user,
    evoke,
  },
  res,
) => {
  const doc = await model(MODEL_NAME).findStrictly(notesID);
  const note = await doc.addToThread({
    date: new Date(),
    author: user.id,
    message,
  });

  evoke(
    await doc
      .populate({ path: 'subscribers' })
      .execPopulate(),
  );

  res.create({
    message: t('messages:addedToThread'),
    note,
  });
};

AddToThreadController.authorization = [redact(MODEL_NAME)];

AddToThreadController.validation = [
  checkMessage,
  checkNoteID,
];

AddToThreadController.effect = [
  async ({ topic, subscribers = [] }, { t }) => {
    const to = subscribers.map((people) => people.email);
    const body = t('messages:newThreadInNoteSummary');
    const subject = t('messages:newThreadInNote', {
      topic,
    });

    return to.length
      ? mailer()
          .to(to)
          .subject(subject)
          .props({ body })
          .send()
      : null;
  },
];

module.exports = compose(AddToThreadController);
