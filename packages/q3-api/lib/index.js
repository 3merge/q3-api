const aa = require('express-async-handler');
const path = require('path');
const dotenv = require('dotenv');
const { get } = require('lodash');
const i18 = require('./config/i18next');
const val = require('./config/validator');
const app = require('./config/express');
const mongoose = require('./config/mongoose');
const { compose, cond } = require('./helpers/utils');
const parser = require('./helpers/parser');
const decorators = require('./helpers/middleware');
const { errors } = require('./helpers/errors');

const { handleUncaughtErrors } = decorators;

dotenv.config();
app.use(decorators);

const Q3Api = {
  ...i18,

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

  define(ctr) {
    return compose([
      val(ctr.validation),
      cond(ctr.authorization),
      aa(ctr),
    ]);
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

  model(name) {
    if (!(name in mongoose.models))
      throw new Error('Model unknown to app');
    return get(mongoose.models, name);
  },

  setModel(name, Schema) {
    return mongoose.model(name, Schema);
  },
};

Q3Api.$app = app;
Q3Api.$mongoose = mongoose;
Q3Api.$errors = errors;

module.exports = Q3Api;
