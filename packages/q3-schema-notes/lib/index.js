const { Schema } = require('mongoose');
// eslint-disable-next-line
const session = require('q3-core-session');

const Thread = new Schema({
  author: String,
  editor: String,
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

Thread.pre('save', function setAuthorName() {
  const user = session.get('USER');

  if (user && user.name) {
    if (this.isNew) {
      this.author = user.name;
    } else {
      this.editor = user.name;
    }
  }
});

module.exports = Note;
