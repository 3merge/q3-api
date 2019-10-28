const mongoose = require('../config/mongoose');
const { MODEL_NAMES } = require('../constants');

const Notes = mongoose.model(
  MODEL_NAMES.NOTES,
  require('./note'),
);

const Users = mongoose.model(
  MODEL_NAMES.USERS,
  require('./user'),
);

const Permissions = mongoose.model(
  MODEL_NAMES.PERMISSIONS,
  require('./permission'),
);

module.exports = {
  Users,
  Permissions,
  Notes,
};
