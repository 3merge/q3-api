// eslint-disable-next-line
const supertest = require('supertest');
const {
  handleUncaughtExceptions,
} = require('q3-core-responder');
const app = require('./config/express');
const mongoose = require('./config/mongoose');

require('./models');
require('./middleware');
require('./plugins');

const setup = async (middleware) => {
  app.use(middleware);
  app.use(handleUncaughtExceptions);
  await mongoose.connect(process.env.CONNECTION);
  return supertest(app);
};

setup.$api = app;
setup.$conn = mongoose;

module.exports = setup;
