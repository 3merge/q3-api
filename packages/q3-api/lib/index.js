require('dotenv').config();
require('q3-locale');
const ctx = require('request-context');
const session = require('q3-core-session');
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
const jobScheduler = require('./scheduler');

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

    runner();
    app.use(walker(__dirname));

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
        if (err) throw err;
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
Q3.schedule = jobScheduler;
Q3.session = ctx;

Object.assign(Q3, models);
module.exports = Q3;
