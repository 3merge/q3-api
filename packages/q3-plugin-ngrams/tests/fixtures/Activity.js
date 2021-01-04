const mongoose = require('mongoose');

module.exports = new mongoose.Schema(
  {
    name: {
      type: String,
      gram: true,
    },
  },
  {
    timestamps: true,
  },
);
