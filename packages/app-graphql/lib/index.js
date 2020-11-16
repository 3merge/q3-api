const { ApolloServer } = require('apollo-server-express');
const schema = require('./schema');
const context = require('./context');

module.exports = new ApolloServer({
  context,
  schema,
});
