/* eslint-disable global-require */
const mongoose = require('mongoose');
const Models = require('./models');
const seed = require('./seed');

module.exports = {
  ...Models,

  start: async () => {
    await mongoose.connect(process.env.CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    return Promise.allSettled(
      Object.values(Models).map((Model) =>
        Model.create(
          seed(Model.collection.collectionName).map(
            (item) => ({
              ...item,
            }),
          ),
        ),
      ),
    );
  },

  stop: async () => {
    await Promise.allSettled(
      Object.values(Models).map((Model) =>
        Model.deleteMany({}),
      ),
    );

    mongoose.disconnect();
  },
};
