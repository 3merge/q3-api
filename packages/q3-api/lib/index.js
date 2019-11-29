require('dotenv').config();
require('q3-locale');
const ctx = require('request-context');
const { get } = require('lodash');
const walker = require('q3-core-walker');
const {
  handleUncaughtExceptions,
} = require('q3-core-responder');
const { middleware } = require('q3-core-composer');
const runner = require('./config');
const app = require('./config/express');
const mongoose = require('./config/mongoose');
const models = require('./models');
const eventEmitter = require('./events');
const mailHelpers = require('./events/utils');

const Q3 = {
  config(args = {}) {
    Object.assign(app.locals, args);
  },

  routes(routes) {
    app.use(
      middleware(
        models.Users,
        models.Permissions,
        ({ user, grant }) => {
          ctx.set('q3-session:user', user);
          ctx.set('q3-session:grant', grant);
        },
      ),
    );

    app.use(walker(__dirname));
    runner();

    if (routes) app.use(routes);
    return app;
  },

  model(name) {
    if (!(name in mongoose.models))
      throw new Error('Unknown model');

    return get(mongoose.models, name);
  },

  setModel(name, Schema) {
    return mongoose.model(name, Schema);
  },

  getSessionUser() {
    return ctx.get('q3-session:user');
  },

  async connect() {
    return new Promise((resolve) => {
      const { CONNECTION, PORT } = process.env;
      mongoose.connect(CONNECTION, (err) => {
        if (err) resolve(err);
        app.use(handleUncaughtExceptions);
        if (process.env.NODE_ENV !== 'test')
          app.listen(PORT);
        resolve(null);
      });
    });
  },
};

Q3.$app = app;
Q3.$mongoose = mongoose;
Q3.emitter = eventEmitter;
Q3.mail = mailHelpers;
Q3.session = ctx;

Object.assign(Q3, models);
module.exports = Q3;
