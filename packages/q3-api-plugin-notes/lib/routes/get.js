const Q3 = require('q3-api').default;
const { Errors } = require('q3-api');
const { MODEL_NAME } = require('../constants');
const { checkNoteID, checkThreadID } = require('./helpers');

const GetInThread = async (
  { params: { noteID, threadID }, translate },
  res,
) => {
  const doc = await Q3.model(MODEL_NAME).findById(noteID);
  const subdoc = doc.thread.id(threadID);

  if (!subdoc)
    throw new Errors.ResourceNotFoundError(
      translate('messages:unknownThread'),
    );

  res.ok({
    thread: subdoc.toJSON({
      virtuals: true,
    }),
  });
};

GetInThread.validation = [checkNoteID, checkThreadID];
module.exports = Q3.define(GetInThread);
