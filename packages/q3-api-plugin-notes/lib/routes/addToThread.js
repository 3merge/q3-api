const Q3 = require('q3-api');
const { MODEL_NAME } = require('../constants');
const { checkMessage, checkNoteID } = require('./helpers');

const AddToThread = async (
  {
    params: { noteID },
    body: { message },
    message: sendMessage,
    translate,
    user,
  },
  res,
) => {
  const doc = await Q3.model(MODEL_NAME).findNoteStrictly(
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
    translate('messages:threadNotification', [
      user.firstName,
      doc.topic,
    ]),
  );

  res.create({
    message: translate('messages:addedToThread'),
    note,
  });
};

AddToThread.validation = [checkMessage, checkNoteID];
module.exports = Q3.define(AddToThread);
