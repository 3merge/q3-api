const { Schema } = require('mongoose');
const { plugin } = require('q3-api-plugin-addresses');

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

Startup.plugin(plugin);
module.exports = Startup;
