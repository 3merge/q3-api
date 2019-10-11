const { model } = require('q3-api');
const { compose } = require('q3-core-composer');
const { MODEL_NAME } = require('../constants');
const { checkNoteID } = require('./helpers');

const DeleteNote = async (
  { params: { noteID }, t },
  res,
) => {
  await model(MODEL_NAME).findByIdAndDelete(noteID);
  res.acknowledge({
    message: t('messages:noteDelete'),
  });
};

DeleteNote.validation = [checkNoteID];
module.exports = compose(DeleteNote);
