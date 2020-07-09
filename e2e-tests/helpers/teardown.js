const Q3 = require('q3-api');

module.exports = async () => {
  await Q3.Users.deleteMany({});
  await Q3.$mongoose.disconnect();
};
