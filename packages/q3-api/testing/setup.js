const {
  MongoMemoryServer,
} = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

module.exports = async () => {
  const mongod = new MongoMemoryServer({
    instance: {
      dbName: 'jest',
    },
  });

  const instance = {
    uri: await mongod.getConnectionString(),
    port: await mongod.getPort(),
    name: await mongod.getDbName(),
  };

  global.__MONGOD__ = mongod;
  process.env.CONNECTION = instance.uri;
  process.env.PORT = instance.port;

  fs.writeFileSync(
    path.join(__dirname, 'globalConfig.json'),
    JSON.stringify(instance),
  );
};
