// require('./config');
const mongoose = require('mongoose');
const assignSchema = require('./assignSchema');
const decorateSchema = require('./decorateSchema');

const MongoAdapter = (connectionString) => ({
  define(SchemaMap) {
    return decorateSchema(assignSchema(SchemaMap));
  },

  start() {
    return mongoose.connect(connectionString).then(() =>
      Object.entries(mongoose.models).forEach(
        ([name, collection]) => {
          this[name] = collection;
        },
      ),
    );
  },

  end() {
    return mongoose.disconnect();
  },
});

module.exports = MongoAdapter;
