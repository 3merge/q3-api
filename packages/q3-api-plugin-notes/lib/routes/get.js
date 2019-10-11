const { model } = require('q3-api');
const { compose } = require('q3-core-composer');
const { MODEL_NAME } = require('../constants');
const { checkNoteID, checkThreadID } = require('./helpers');

const GetInThread = async (
  { params: { noteID, threadID }, user },
  res,
) => {
  const doc = await model(MODEL_NAME).findNoteStrictly(
    noteID,
  );

  res.ok({
    thread: doc.findThreadStrictly(threadID, user).toJSON({
      virtuals: true,
    }),
  });
};

GetInThread.validation = [checkNoteID, checkThreadID];
module.exports = compose(GetInThread);
