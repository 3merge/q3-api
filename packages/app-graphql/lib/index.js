const { ApolloServer } = require('apollo-server-express');
const schema = require('./crud');

module.exports = new ApolloServer({
  schema,
});
