const mongoose = require('mongoose');

module.exports = (SchemaMap) => {
  return new mongoose.Schema(SchemaMap);
};
