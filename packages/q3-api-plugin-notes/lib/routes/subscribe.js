const Q3 = require('q3-api');
const { MODEL_NAME } = require('../constants');
const { checkNoteID } = require('./helpers');

const Subscribe = async (
  { params: { noteID }, translate, user },
  res,
) => {
  await Q3.model(MODEL_NAME).updateOne(
    {
      _id: noteID,
    },
    {
      $addToSet: {
        subscribers: user.id,
      },
    },
  );

  res.acknowledge({
    message: translate('messages:subscribed'),
  });
};

Subscribe.validation = [checkNoteID];

module.exports = Q3.define(Subscribe);
