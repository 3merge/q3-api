require('dotenv').config();

const { get } = require('lodash');
const walker = require('q3-core-walker');
const {
  handleUncaughtExceptions,
} = require('q3-core-responder');
const i18next = require('i18next');
const { middleware } = require('q3-core-composer');
const path = require('path');
const runner = require('./config');
const core = require('./config/core');
const app = require('./config/express');
const mongoose = require('./config/mongoose');
const models = require('./models');
const { DatabaseStream } = require('./helpers');
const cluster = require('./config/cluster');

const connectToDB = (res, rej) => (err) => {
  if (err) return rej(err);
  app.use(handleUncaughtExceptions);

  if (cluster.isWorkerEnvironment) {
    app.set('changestream', new DatabaseStream().init());
    app.listen(process.env.PORT, () => {});
  }

  return res(null);
};

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
  config(args = {}) {
    const location = locate();

    if (!location && !args.location)
      throw new Error('App requires a location');

    Object.assign(app.locals, { location }, args);
    core(app.locals.location);

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
            connectToDB(resolve, reject),
          ),
    ).catch((e) => {
      // eslint-disable-next-line
      console.error(e);
      process.exit(0);
    }),

  saveToSessionNotifications: async (...params) =>
    models.Notifications.saveToSessionNotifications(
      ...params,
    ),

  saveToSessionDownloads: async (...params) =>
    models.Notifications.saveToSessionDownloads(...params),
};

Q3.$app = app;
Q3.$mongoose = mongoose;
Q3.$i18 = i18next;

Object.assign(Q3, models);
module.exports = Q3;
