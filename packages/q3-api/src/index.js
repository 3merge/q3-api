import aa from 'express-async-handler';
import path from 'path';
import dotenv from 'dotenv';
import { get } from 'lodash';
import i18 from './lib/i18next';
import val from './lib/validator';
import app from './lib/express';
import mongoose from './lib/mongoose';
import { compose } from './helpers/utils';
import events from './helpers/events';
import parser from './helpers/parser';
import decorators, {
  handleUncaughtErrors,
} from './helpers/middleware';
import * as Errors from './helpers/errors';

export { app, i18, mongoose, compose, Errors };

export default {
  connect() {
    return new Promise((resolve) => {
      const { CONNECTION, PORT } = process.env;
      mongoose.connect(CONNECTION, (err) => {
        if (err) resolve(err);
        app.use(handleUncaughtErrors);
        app.listen(PORT);
        resolve(null);
      });
    });
  },

  init() {
    dotenv.config();
    app.use(decorators);
    return app;
  },

  define(ctr) {
    return compose([val(ctr.validation), aa(ctr)]);
  },

  register(plugin, opts) {
    plugin(app, mongoose, opts);
  },

  walk(dir) {
    const workingDir = process.cwd();
    app.use(
      parser(dir ? path.join(workingDir, dir) : workingDir),
    );
  },

  notify(cmd, opts) {
    events.emit(cmd, opts);
  },

  subscribe() {
    return events;
  },

  translate(msg) {
    return i18.t(msg);
  },

  model(name) {
    if (!(name in mongoose.models))
      throw new Error('Model unknown to app');
    return get(mongoose.models, name);
  },

  setModel(name, Schema) {
    mongoose.model(name, Schema);
  },
};
