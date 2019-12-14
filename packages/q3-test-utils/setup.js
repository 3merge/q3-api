const MongodbMemoryServer = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

/* eslint-disable-next-line  */
const mongod = new MongodbMemoryServer.default({
  autoStart: false,
  instance: {
    dbName: 'jest',
  },
  binary: {
    skipMD5: true,
  },
});

module.exports = async () => {
  if (!mongod.isRunning) {
    await mongod.start();
  }

  const instance = {
    uri: await mongod.getConnectionString(),
    name: await mongod.getDbName(),
  };

  global.__MONGOD__ = mongod;
  process.env.CONNECTION = instance.uri;

  fs.writeFileSync(
    path.join(__dirname, 'globalConfig.json'),
    JSON.stringify(instance),
  );
};
