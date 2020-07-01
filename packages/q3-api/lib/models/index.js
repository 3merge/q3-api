const UserModel = require('q3-schema-users');
const mongoose = require('../config/mongoose');
const { MODEL_NAMES } = require('../constants');
const ReportsSchema = require('./reports');

UserModel.set('restify', '*');
UserModel.set('collectionSingularName', 'user');
UserModel.set('collectionPluralName', 'users');
UserModel.set('withVersioning', true);

const Users = mongoose.model(MODEL_NAMES.USERS, UserModel);
const Reports = mongoose.model(
  MODEL_NAMES.REPORTS,
  ReportsSchema,
);

module.exports = {
  Reports,
  Users,
};
