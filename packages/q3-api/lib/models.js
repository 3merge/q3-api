const NotifiationSchema = require('q3-schema-notifications');
const UserModel = require('q3-schema-users');
const mongoose = require('q3-adapter-mongoose');
const { MODEL_NAMES } = require('./constants');

UserModel.set('restify', '*');
UserModel.set('collectionSingularName', 'user');
UserModel.set('collectionPluralName', 'users');
UserModel.set('withVersioning', true);

const Users = mongoose.setModel(
  MODEL_NAMES.USERS,
  UserModel,
);

const Notifications = mongoose.setModel(
  MODEL_NAMES.NOTIFICATIONS,
  NotifiationSchema,
);

module.exports = {
  Users,
  Notifications,
};
