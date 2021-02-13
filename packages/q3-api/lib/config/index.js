const { mongoose } = require('q3-adapter-mongoose');
const rest = require('q3-core-rest');
const app = require('./express');

const autoRouter = rest(app, mongoose);
const { run } = autoRouter.init();

module.exports = run;
