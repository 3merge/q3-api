const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
  keywords: {
    type: [String],
    gram: true,
  },
});
