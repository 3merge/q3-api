const { Schema } = require('mongoose');
const ctx = require('request-context');
const { MODEL_NAMES } = require('../../constants');

const Thread = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: MODEL_NAMES.USERS,
  },
  date: {
    type: Date,
  },
  message: {
    type: String,
    required: true,
  },
});

Thread.pre('save', function() {
  if (this.isNew) {
    this.author = ctx.get('q3-session:user.id');
    this.date = new Date();
  }
});

module.exports = new Schema(
  {
    topic: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    subscribers: [
      {
        type: Schema.Types.ObjectId,
        ref: MODEL_NAMES.USERS,
      },
    ],
    thread: {
      type: [Thread],
      select: false,
    },
  },
  {
    timestamps: true,
    restify: 'post patch delete get',
    collectionPluralName: 'notes',
    collectionSingularName: 'note',
  },
);
