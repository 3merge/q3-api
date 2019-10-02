const schema = require('./model');
const routes = require('./routes');

module.exports = (app, db) => {
  db.model('Q3Files', schema);
  app.use(routes);
};
