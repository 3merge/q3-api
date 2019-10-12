const { model } = require('q3-api');
const {
  compose,
  verify,
  redact,
} = require('q3-core-composer');
const { MODEL_NAME } = require('../../constants');
const {
  checkNoteID,
  checkThreadID,
} = require('../../helpers');

const GetInThread = async (
  { params: { noteID, threadID }, user },
  res,
) => {
  const doc = await model(MODEL_NAME).findStrictly(noteID);
  const thread = await doc.findThreadStrictly(
    threadID,
    user,
  );

  res.ok({
    thread,
  });
};

GetInThread.authorization = [verify(), redact(MODEL_NAME)];
GetInThread.validation = [checkNoteID, checkThreadID];

module.exports = compose(GetInThread);
