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
  .connect(
    'mongodb+srv://ibberson92:vNyxPbjujYn37s9c@cluster0.v8oab.mongodb.net/<dbname>?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true },
  )
  .then(() => {
    app.listen('4000', () => {
      console.log('Server ready');
    });
  });
