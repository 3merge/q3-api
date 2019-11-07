require('dotenv').config();
const ctx = require('request-context');
const { get } = require('lodash');
const walker = require('q3-core-walker');
const path = require('path');
const {
  loadLocaleFromFs,
  handleUncaughtExceptions,
} = require('q3-core-responder');
const app = require('./config/express');
const mongoose = require('./config/mongoose');
const restify = require('./restify');
const eventEmitter = require('./events');
const mailHelpers = require('./events/utils');

/**
 * Auto-appends middleware
 */
require('./middleware');

const { Users } = require('./models');

const Q3 = {};
Q3.User = Users;

Q3.$app = app;
Q3.$mongoose = mongoose;
Q3.emitter = eventEmitter;
Q3.mail = mailHelpers;
Q3.session = ctx;

Q3.config = (args = {}) => {
  Object.assign(app.locals, args);
};

Q3.routes = (routes) => {
  /**
   * Init routes and locale.
   */
  app.use(walker(__dirname));
  loadLocaleFromFs(path.resolve(__dirname, '..'));

  Object.values(mongoose.models).forEach(restify);
  if (routes) app.use(routes);
};

Q3.model = (name) => {
  if (!(name in mongoose.models))
    throw new Error('Unknown model');
  return get(mongoose.models, name);
};

Q3.setModel = (name, Schema) =>
  mongoose.model(name, Schema);

Q3.getSessionUser = () => ctx.get('q3-session:user');

Q3.connect = () =>
  new Promise((resolve) => {
    const { CONNECTION, PORT } = process.env;
    mongoose.connect(CONNECTION, (err) => {
      if (err) resolve(err);
      app.use(handleUncaughtExceptions);
      if (process.env.NODE_ENV !== 'test') app.listen(PORT);
      resolve(null);
    });
  });

module.exports = Q3;
