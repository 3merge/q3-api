const { Schema } = require('mongoose');

const Thread = new Schema({
  message: {
    type: String,
    required: true,
    createdBy: {
      type: Schema.Types.ObjectId,
      autopopulate: true,
      autopopulateSelect: 'id firstName lastName email',
      ref: 'q3-api-users',
    },
  },
});

const Note = new Schema({
  thread: {
    type: [Thread],
    select: false,
  },
});

module.exports = Note;
