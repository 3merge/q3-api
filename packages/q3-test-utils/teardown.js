const mongoose = require('mongoose');

module.exports = () => {
  mongoose.connection.close();
  global.__MONGOD__.stop();
};
