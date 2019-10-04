const mongoose = require('../config/mongoose');

mongoose.plugin(require('./commons'));
mongoose.plugin(require('./access'));
