const { model } = require('q3-api');
const { compose } = require('q3-core-composer');
const { MODEL_NAME } = require('../constants');
const { checkNoteID } = require('./helpers');

const Unsubscribe = async (
  { params: { noteID }, t, user },
  res,
) => {
  await model(MODEL_NAME).updateOne(
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
    message: t('messages:unsubscribed'),
  });
};

Unsubscribe.validation = [checkNoteID];

module.exports = compose(Unsubscribe);
