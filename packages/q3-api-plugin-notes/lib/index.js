const schema = require('./model');
const routes = require('./routes');
const { MODEL_NAME } = require('./constants');

module.exports = (app, db, opts = {}) => {
  const { userModelName } = opts;
  db.model(MODEL_NAME, schema(userModelName));
  app.use(routes);
};
