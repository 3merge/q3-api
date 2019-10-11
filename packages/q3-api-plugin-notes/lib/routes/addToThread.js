const { model } = require('q3-api');
const { compose } = require('q3-core-composer');
const { MODEL_NAME } = require('../constants');
const { checkMessage, checkNoteID } = require('./helpers');

const AddToThread = async (
  {
    params: { noteID },
    body: { message },
    message: sendMessage,
    t,
    user,
  },
  res,
) => {
  const doc = await model(MODEL_NAME).findNoteStrictly(
    noteID,
  );

  const note = await doc.addToThread({
    author: user.id,
    message,
  });

  const { subscribers } = await doc
    .populate({ path: 'subscribers' })
    .execPopulate();

  sendMessage(
    subscribers.map((people) => people.email).join(','),
    t('messages:threadNotification', [
      user.firstName,
      doc.topic,
    ]),
  );

  res.create({
    message: t('messages:addedToThread'),
    note,
  });
};

AddToThread.validation = [checkMessage, checkNoteID];
module.exports = compose(AddToThread);
