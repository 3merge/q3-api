const { Schema } = require('mongoose');

const Thread = new Schema({
  message: {
    type: String,
    required: true,
  },
});

const Note = new Schema({
  thread: {
    type: [Thread],
    select: false,
  },
});

module.exports = Note;
