const mongoose = require('mongoose');
const School = require('./School');

module.exports = School.discriminator(
  'colleges',
  new mongoose.Schema({
    test: {
      type: String,
      default: 'Foo',
    },
    professors: [
      {
        professor: {
          autopopulate: true,
          autopopulateSelect: 'name',
          type: mongoose.Schema.Types.ObjectId,
          ref: 'teachers',
          required: true,
        },
      },
    ],
  }),
);
