const contextService = require('request-context');
const { permit, redact } = require('./middleware');
const plugin = require('./plugin');
const { MODEL_NAME } = require('./constants');
const schema = require('./model');

const preRouteRBAC = (app, db) => {
  db.model(MODEL_NAME, schema);
  app.use(contextService.middleware('q3-session'));
};

module.exports = {
  preRouteRBAC,
  plugin,
  permit,
  redact,
};
