const mongoose = require('mongoose');
const assignSchema = require('./assignSchema');
const decorateSchema = require('./decorateSchema');
const Types = require('./types');

const MongoAdapter = (
  connectionString,
  plugins = [],
  options = {},
) => {
  if (!options || !options.disableGlobalSettings)
    // eslint-disable-next-line
    require('./config');

  return {
    Types,

    fromDatasource: (collectionName) => {
      const Model = mongoose.models[collectionName];

      if (!Model)
        throw new Error('Unknown model in datasource');

      return Model;
    },

    define(SchemaMap) {
      const exec = (val) =>
        decorateSchema(assignSchema(val));

      const i = exec(SchemaMap);

      i.Types = Types;

      plugins.forEach((plugin) =>
        i.extend(
          plugin(i, {
            Types,
            define: exec,
          }),
        ),
      );

      return i;
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
  };
};

module.exports = MongoAdapter;
