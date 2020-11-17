require('@3merge/app-resolvers');

module.exports = (app) => {
  const ApolloServerInstance = require('./lib');
  ApolloServerInstance.applyMiddleware({
    playground: {
      cdnUrl: 'https://cdn.jsdelivr.net/npm',
      faviconUrl: '',
    },
    path: '/graphql',
    app,
  });
};
