const mongoose = require('../config/mongoose');
const { MODEL_NAMES } = require('../constants');

mongoose.model(MODEL_NAMES.USERS, require('./user'));
mongoose.model(MODEL_NAMES.USERS, require('./permission'));
