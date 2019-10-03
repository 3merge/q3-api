const contextService = require('request-context');
const { MODEL_NAME } = require('./constants');
const schema = require('./model');
const routes = require('./routes');

const Q3Roles = (app, db) => {
  db.model(MODEL_NAME, schema);
  app.use(contextService.middleware('q3-session'));
  app.use(routes);
};

// named exports
Q3Roles.plugin = require('./plugin');
Object.assign(Q3Roles, require('./middleware'));

module.exports = Q3Roles;
