/* eslint-disable global-require */
const mongoose = require('mongoose');
const Models = require('./models');
const seed = require('./seed');

module.exports = {
  ...Models,

  setup: async () => {
    await mongoose.connect(process.env.CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  },

  start: async () =>
    Promise.allSettled(
      Object.values(Models).map((Model) =>
        Model.create(
          seed(Model.collection.collectionName).map(
            (item) => ({
              ...item,
            }),
          ),
        ),
      ),
    ),

  stop: async () => {
    await Promise.allSettled(
      Object.values(Models).map((Model) =>
        Model.deleteMany({}),
      ),
    );
  },

  teardown: () => {
    mongoose.disconnect();
  },
};
