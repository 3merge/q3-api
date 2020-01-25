const NodeEnvironment = require('jest-environment-node');
const path = require('path');
const fs = require('fs');

module.exports = class MongoEnvironment extends NodeEnvironment {
  async setup() {
    const globalConfig = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, 'globalConfig.json'),
        'utf-8',
      ),
    );

    this.global.__MONGO_URI__ = globalConfig.uri;
    this.global.__MONGO_DB_NAME__ = globalConfig.name;
    await super.setup();
  }

  async teardown(done) {
    await super.teardown();
    done();
  }

  runScript(script) {
    return super.runScript(script);
  }
};
