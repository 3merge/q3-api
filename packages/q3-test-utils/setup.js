const {
  MongoMemoryReplSet,
} = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

module.exports = async () => {
  const mongod = new MongoMemoryReplSet({
    autoStart: true,
    retryWrites: false,
    replSet: { storageEngine: 'wiredTiger' },
  });

  await mongod.waitUntilRunning();

  const instance = {
    uri: `${await mongod.getConnectionString()}&retryWrites=false`,
    name: await mongod.getDbName(),
  };

  global.__MONGOD__ = mongod;
  process.env.CONNECTION = instance.uri;

  fs.writeFileSync(
    path.join(__dirname, 'globalConfig.json'),
    JSON.stringify(instance),
  );
};
