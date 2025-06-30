#!/usr/bin/env node
/* eslint-disable no-console,global-require */
require('dotenv').config();
require('../lib/models/domainsResources');

const path = require('path');
const session = require('q3-core-session');
const db = require('./helpers/db');
const cli = require('./helpers/cli');

require('./helpers/onMaster')(async () => {
  console.log('Connecting to database...');
  await db();

  session.hydrate({}, async () => {
    try {
      // eslint-disable-next-line
      await require(path.resolve(
        process.cwd(),
        `lib/chores/${cli.findArgument('path', null)}`,
      ))();

      console.log('Finished');
    } catch (e) {
      console.warn('Failed: ', e);
    }
  });

  process.exit();
});
