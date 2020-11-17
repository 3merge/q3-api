const {
  ApolloError,
  ApolloServer,
} = require('apollo-server-express');
const pick = require('lodash');
const schema = require('./schema');
const context = require('./context');

module.exports = new ApolloServer({
  context,
  schema,
  formatError: (err) => {
    const exc = err?.extensions?.exception;

    return exc
      ? new ApolloError(
          err.message,
          exc.name,
          pick(exc, ['errors', 'statusCode', 'code']),
        )
      : err;
  },
});
