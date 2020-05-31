const mongoose = require('mongoose');
const Student = require('../student');

module.exports = Student.discriminator(
  'teach-assistant',
  new mongoose.Schema(
    {
      class: String,
    },
    {
      restify: '*',
    },
  ),
);
