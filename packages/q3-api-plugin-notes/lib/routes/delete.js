const Q3 = require('q3-api');
const { MODEL_NAME } = require('../constants');
const { checkNoteID } = require('./helpers');

const DeleteNote = async (
  { params: { noteID }, translate },
  res,
) => {
  await Q3.model(MODEL_NAME).findByIdAndDelete(noteID);
  res.acknowledge({
    message: translate('messages:noteDelete'),
  });
};

DeleteNote.validation = [checkNoteID];
module.exports = Q3.define(DeleteNote);
