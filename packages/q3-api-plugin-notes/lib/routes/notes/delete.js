const { model } = require('q3-api');
const { compose, redact } = require('q3-core-composer');
const { MODEL_NAME } = require('../../constants');
const { checkNoteID } = require('../../helpers');

const DeleteNoteController = async (
  { params: { noteID }, t },
  res,
) => {
  await model(MODEL_NAME).findByIdAndDelete(noteID);
  res.acknowledge({
    message: t('messages:noteDelete'),
  });
};

DeleteNoteController.validation = [checkNoteID];
DeleteNoteController.authorization = [redact(MODEL_NAME)];

module.exports = compose(DeleteNoteController);
