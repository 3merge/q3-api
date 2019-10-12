const walk = require('q3-core-walker');
const schema = require('./model');
const { MODEL_NAME } = require('./constants');

module.exports = (app, db, opts = {}) => {
  const { userModelName } = opts;
  db.model(MODEL_NAME, schema(userModelName));
  app.use(walk('packages/q3-api-plugin-notes/lib/routes'));
};
