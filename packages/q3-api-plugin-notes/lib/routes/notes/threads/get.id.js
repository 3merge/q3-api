const { model } = require('q3-api');
const { compose, redact } = require('q3-core-composer');
const { MODEL_NAME } = require('../../../constants');
const {
  checkNoteID,
  checkThreadID,
} = require('../../../helpers');

const GetInThreadController = async (
  { params: { notesID, threadsID } },
  res,
) => {
  const doc = await model(MODEL_NAME).findStrictly(notesID);
  const thread = await doc.findThreadStrictly(threadsID);

  res.ok({
    thread,
  });
};

GetInThreadController.authorization = [redact(MODEL_NAME)];

GetInThreadController.validation = [
  checkNoteID,
  checkThreadID,
];

module.exports = compose(GetInThreadController);
