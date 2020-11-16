require('@3merge/app-resolvers');
const json = require('../../demo/q3-access.json');

require('dotenv').config({
  path: require('path').resolve(__dirname, '../../.env'),
});

require('../../demo/models');
require('../q3-api/lib/models');

const { AccessControl } = require('q3-core-access');
const express = require('express');
const mongoose = require('mongoose');
const ApolloServerInstance = require('./lib');

module.exports = (app) =>
  ApolloServerInstance.applyMiddleware({
    path: '/graphql',
    app,
  });

const app = express();
ApolloServerInstance.applyMiddleware({
  path: '/graphql',
  app,
});

mongoose
  .connect(process.env.CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    AccessControl.init(json);
    app.listen('4000', () => {
      console.log('Server ready');
    });
  });
