const contextService = require('request-context');
const { MODEL_NAME } = require('./constants');
const schema = require('./model');
const routes = require('./routes');
const plugin = require('./plugin');
const middleware = require('./middleware');

module.exports = {
  plugin,

  middleware: (app, db) => {
    db.model(MODEL_NAME, schema);
    app.use(contextService.middleware('q3-session'));
    app.use(middleware);
    app.us(routes);
  },
};
