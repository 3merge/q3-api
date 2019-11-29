const { Schema } = require('mongoose');

const Thread = new Schema({
  message: {
    type: String,
    required: true,
  },
});

module.exports = new Schema({
  thread: {
    type: [Thread],
    select: false,
  },
});
