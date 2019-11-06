const { Schema } = require('mongoose');

const Vertical = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
    id: true,
  },
);

const Startup = new Schema({
  sector: {
    type: String,
    required: true,
    searchable: true,
  },
  vertical: Vertical,
});

module.exports = Startup;
