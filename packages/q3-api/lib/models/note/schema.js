const { Schema } = require('mongoose');

const Thread = new Schema(
  {
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = new Schema(
  {
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
