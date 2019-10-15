require('dotenv').config();

const { get } = require('lodash');
const walker = require('q3-core-walker');
const i18 = require('./config/i18next');
const app = require('./config/express');
const mongoose = require('./config/mongoose');
const manageErrors = require('./errors');
const {
  handleUncaughtErrors,
} = require('./middleware/decorators');

require('./middleware');
require('./plugins');

const { Users } = require('./models');

app.use(walker(__dirname));

const Q3 = {};

Q3.$app = app;
Q3.$mongoose = mongoose;
Q3.User = Users;
Q3.exception = manageErrors;

Q3.config = (args = {}) => {
  Object.assign(app.locals, args);
};

Q3.routes = (routes) => {
  app.use(routes);
};

Q3.model = (name) => {
  if (!(name in mongoose.models))
    throw new Error('Unknown model');
  return get(mongoose.models, name);
};

Q3.setModel = (name, Schema) =>
  mongoose.model(name, Schema);

Q3.connect = () =>
  new Promise((resolve) => {
    const { CONNECTION, PORT } = process.env;
    mongoose.connect(CONNECTION, (err) => {
      if (err) resolve(err);
      app.use(handleUncaughtErrors);
      if (process.env.NODE_ENV !== 'test') app.listen(PORT);
      resolve(null);
    });
  });

Object.assign(Q3, i18);
module.exports = Q3;
