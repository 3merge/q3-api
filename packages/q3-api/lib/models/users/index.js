const UserModel = require('q3-schema-users');
const mongoose = require('../../config/mongoose');
const { MODEL_NAMES } = require('../../constants');

UserModel.set('restify', '*');
UserModel.set('collectionSingularName', 'user');
UserModel.set('collectionPluralName', 'users');
UserModel.set('withVersioning', true);

module.exports = mongoose.model(
  MODEL_NAMES.USERS,
  UserModel,
);
