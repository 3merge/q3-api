const { Schema } = require('mongoose');
// eslint-disable-next-line
const session = require('q3-core-session');

const Thread = new Schema(
  {
    author: String,
    editor: String,
    message: String,
    tags: [String],
    title: String,
    pin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Note = new Schema({
  thread: {
    type: [Thread],
    select: false,
  },
});

Thread.pre('save', function setAuthorName() {
  const user = session.get('USER');

  if (this.isModified('message')) {
    if (user && user.name) {
      if (this.isNew) {
        this.author = user.name;
      } else {
        this.editor = user.name;
      }
    }
  }
});

module.exports = Note;
