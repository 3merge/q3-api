const {
  MongoMemoryServer,
} = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

module.exports = async () => {
  const mongod = new MongoMemoryServer({
    autoStart: true,
  });

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
