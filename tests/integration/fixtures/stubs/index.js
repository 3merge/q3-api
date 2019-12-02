const { Users, Permissions } = require('q3-api');
const { Products } = require('../models');
const permissions = require('./permissions.json');
const products = require('./products.json');
const users = require('./users.json');

exports.seed = async () => {
  await Users.create(users);
  await Products.create(products);
  await Permissions.create(permissions);
};

exports.destroy = async () => {
  await Permissions.deleteMany({});
  await Products.deleteMany({});
  await Users.deleteMany({});
};
