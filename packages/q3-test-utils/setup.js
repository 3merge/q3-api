const {
  MongoMemoryReplSet,
} = require('mongodb-memory-server');
const mongoose = require('mongoose');

module.exports = async () => {
  if (!process.env.CONNECTION) {
    const mongod = await MongoMemoryReplSet.create({
      instanceOpts: [{ storageEngine: 'wiredTiger' }],
    });

    process.env.CONNECTION = mongod.getUri();
    global.__MONGOD__ = mongod;

    await mongoose.connect(process.env.CONNECTION);
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  }
};
