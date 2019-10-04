// eslint-disable-next-line
const supertest = require('supertest');
const app = require('./config/express');
const mongoose = require('./config/mongoose');
const {
  handleUncaughtErrors,
} = require('./middleware/decorators');

require('./models');
require('./middleware');
require('./plugins');

const setup = async (middleware) => {
  app.use(middleware);
  app.use(handleUncaughtErrors);
  await mongoose.connect(process.env.CONNECTION);
  return supertest(app);
};

setup.$api = app;
setup.$conn = mongoose;

module.exports = setup;
