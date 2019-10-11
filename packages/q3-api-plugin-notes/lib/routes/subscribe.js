const { model } = require('q3-api');
const { compose } = require('q3-core-composer');
const { MODEL_NAME } = require('../constants');
const { checkNoteID } = require('./helpers');

const Subscribe = async (
  { params: { noteID }, translate, user },
  res,
) => {
  await model(MODEL_NAME).updateOne(
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

module.exports = compose(Subscribe);
