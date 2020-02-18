const PermissionModel = require('q3-schema-permissions');
const UserModel = require('q3-schema-users');
const mongoose = require('../config/mongoose');
const { MODEL_NAMES } = require('../constants');

UserModel.set('restify', '*');
UserModel.set('collectionSingularName', 'user');
UserModel.set('collectionPluralName', 'users');
UserModel.set('withVersioning', true);

PermissionModel.set('restify', '*');
PermissionModel.set('collectionSingularName', 'permission');
PermissionModel.set('collectionPluralName', 'permissions');
PermissionModel.set('withVersioning', true);

const Users = mongoose.model(MODEL_NAMES.USERS, UserModel);

const Permissions = mongoose.model(
  MODEL_NAMES.PERMISSIONS,
  PermissionModel,
);

module.exports = {
  Users,
  Permissions,
};
