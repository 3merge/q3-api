require('dotenv').config();
require('q3-locale');

const { get } = require('lodash');
const walker = require('q3-core-walker');
const { AccessControl } = require('q3-core-access');
const {
  handleUncaughtExceptions,
} = require('q3-core-responder');
const { middleware } = require('q3-core-composer');
const runner = require('./config');
const app = require('./config/express');
const mongoose = require('./config/mongoose');
const models = require('./models');

const Q3 = {
  protect(grants = []) {
    AccessControl.init(grants);
    return this;
  },

  config(args = {}) {
    Object.assign(app.locals, args);
    return this;
  },

  routes(routes) {
    app.use(middleware(models.Users));
    runner();

    app.use(walker(__dirname));
    if (routes) app.use(routes);
    return this;
  },

  model(name) {
    if (!(name in mongoose.models))
      throw new Error('Unknown model');

    return get(mongoose.models, name);
  },

  setModel(name, Schema) {
    return mongoose.model(name, Schema);
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

Object.assign(Q3, models);
module.exports = Q3;
