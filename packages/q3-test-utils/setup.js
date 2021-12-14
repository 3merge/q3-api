const {
  MongoMemoryReplSet,
} = require('mongodb-memory-server');
const mongoose = require('mongoose');

module.exports = async () => {
  if (process.env.CONNECTION) {
    try {
      await mongoose.connect(process.env.CONNECTION, {
        connectTimeoutMS: 10,
      });

      await mongoose.connection.db.dropDatabase();
      await mongoose.disconnect();
    } catch (e) {
      delete process.env.CONNECTION;
    }
  }

  if (!process.env.CONNECTION) {
    const mongod = await MongoMemoryReplSet.create({
      instanceOpts: [{ storageEngine: 'wiredTiger' }],
    });

    process.env.CONNECTION = mongod.getUri();
    global.__MONGOD__ = mongod;
  }
};
