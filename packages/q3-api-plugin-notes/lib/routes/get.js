const Q3 = require('q3-api');
const { MODEL_NAME } = require('../constants');
const { checkNoteID, checkThreadID } = require('./helpers');

const GetInThread = async (
  { params: { noteID, threadID }, user },
  res,
) => {
  const doc = await Q3.model(MODEL_NAME).findNoteStrictly(
    noteID,
  );

  res.ok({
    thread: doc.findThreadStrictly(threadID, user).toJSON({
      virtuals: true,
    }),
  });
};

GetInThread.validation = [checkNoteID, checkThreadID];
module.exports = Q3.define(GetInThread);
