require('dotenv').config();
require('q3-locale');

const { get } = require('lodash');
const walker = require('q3-core-walker');
const { AccessControl } = require('q3-core-access');
const {
  handleUncaughtExceptions,
} = require('q3-core-responder');
const i18next = require('i18next');
const { middleware } = require('q3-core-composer');
const { config } = require('q3-core-mailer');
const path = require('path');
const locale = require('q3-locale');
const runner = require('./config');
const app = require('./config/express');
const io = require('./config/socket');
const mongoose = require('./config/mongoose');
const models = require('./models');

/**
 * When testing, frameworks like supertest attach listeners.
 */
const connectToDB = (res, rej) => (err) => {
  if (err) return rej(err);
  app.use(handleUncaughtExceptions);
  if (process.env.NODE_ENV !== 'test') {
    // will attach to app during
    io.listen();
  }

  return res(null);
};

const registerLocale = ({ location }) => () =>
  new Promise((resolve) => {
    try {
      locale(location);
    } catch (e) {
      // noop
    }

    resolve();
  });

/**
 * See q3-core-mailer for more details.
 * Essentially, it uses the location to register event handlers by the file system architecture.
 */
const registerChores = ({ location, chores }) => () =>
  chores && location ? config(chores).walk(location) : null;

/**
 * Uses the package.json file to locate app index.
 */
const locate = () => {
  try {
    const root = process.cwd();
    // eslint-disable-next-line
    const r = require(path.resolve(root, './package.json'));
    return path.parse(path.resolve(root, r.main)).dir;
  } catch (e) {
    return null;
  }
};

const Q3 = {
  protect(grants = []) {
    AccessControl.init(grants);
    return this;
  },

  config(args = {}) {
    const location = locate();

    if (!location && !args.location)
      throw new Error('App requires a location');

    Object.assign(
      app.locals,
      {
        location,
      },
      args,
    );

    return this;
  },

  routes() {
    const { location } = app.locals;
    app.use(middleware(models.Users));
    runner();

    app.use(walker(__dirname));
    app.use(walker(location));
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

  connect: async (directConnectionString) =>
    new Promise((resolve, reject) =>
      directConnectionString
        ? mongoose.connect(directConnectionString, (e) => {
            if (e) reject(e);
            resolve();
          })
        : mongoose.connect(
            process.env.CONNECTION,
            connectToDB((data) => {
              // otherwise it doesn't get called
              registerChores(app.locals);
              return resolve(data);
            }, reject),
          ),
    )
      .then(registerLocale(app.locals))
      .catch((e) => {
        // eslint-disable-next-line
        console.error(e);
        process.exit(0);
      }),
};

Q3.$app = app;
Q3.$mongoose = mongoose;
Q3.$i18 = i18next;

Object.assign(Q3, models);
module.exports = Q3;
