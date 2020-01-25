const mongoose = require('mongoose');

module.exports = async () => {
  await mongoose.disconnect();
  return global.__MONGOD__.stop();
};
