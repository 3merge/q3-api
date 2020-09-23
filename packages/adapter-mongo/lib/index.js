require('./config');
const mongoose = require('mongoose');
const assignSchema = require('./assignSchema');
const decorateSchema = require('./decorateSchema');

const MongoAdapter = () => ({
  define: (SchemaMap) =>
    decorateSchema(assignSchema(SchemaMap)),

  connect: (connectionString) =>
    mongoose.connect(connectionString),
});

module.exports = MongoAdapter;
