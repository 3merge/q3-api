const { Users, Permissions } = require('q3-api');
const permissions = require('./permissions.json');
const users = require('./users.json');

exports.seed = async () => {
  await Users.create(users);
  await Permissions.create(permissions);
};

exports.destroy = async () => {
  await Users.deleteMany({});
  await Permissions.deleteMany({});
};
