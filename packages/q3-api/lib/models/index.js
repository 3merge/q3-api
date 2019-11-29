const PermissionModel = require('q3-schema-permissions');
const UserModel = require('q3-schema-users');
const mongoose = require('../config/mongoose');
const { MODEL_NAMES } = require('../constants');

const Notes = mongoose.model(
  MODEL_NAMES.NOTES,
  require('./note'),
);

const Users = mongoose.model(MODEL_NAMES.USERS, UserModel);

const Permissions = mongoose.model(
  MODEL_NAMES.PERMISSIONS,
  PermissionModel,
);

module.exports = {
  Users,
  Permissions,
  Notes,
};
