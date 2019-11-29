const rest = require('q3-core-rest');
const app = require('./express');
const mongoose = require('./mongoose');

const autoRouter = rest(app, mongoose);
const { run } = autoRouter.init();

module.exports = run;
