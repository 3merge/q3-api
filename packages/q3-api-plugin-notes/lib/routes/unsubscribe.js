const Q3 = require('q3-api');
const { MODEL_NAME } = require('../constants');
const { checkNoteID } = require('./helpers');

const Unsubscribe = async (
  { params: { noteID }, translate, user },
  res,
) => {
  await Q3.model(MODEL_NAME).updateOne(
    {
      _id: noteID,
    },
    {
      $pull: {
        subscribers: user.id,
      },
    },
  );

  res.acknowledge({
    message: translate('messages:unsubscribed'),
  });
};

Unsubscribe.validation = [checkNoteID];

module.exports = Q3.define(Unsubscribe);
