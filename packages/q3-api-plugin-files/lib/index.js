const schema = require('./model');
const routes = require('./routes');

const registration = (app, db) => {
  db.model('Q3Files', schema);
  app.use(routes);
};

registration.middleware = routes;
registration.plugin = schema;

module.exports = registration;
