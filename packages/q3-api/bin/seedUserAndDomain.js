#!/usr/bin/env node
/* eslint-disable no-console,global-require */
require('dotenv').config();
require('q3-schema-types');

const db = require('./helpers/db');
const Domain = require('../lib/models/domains');
const User = require('../lib/models/users');
const cli = require('./helpers/cli');

(async () => {
  console.log('Connecting to database...');
  await db();

  console.log('Adding first domain...');
  await Domain.create(require('./fixtures/domain.json'));

  console.log('Adding first user...');
  await User.create({
    ...require('./fixtures/user.json'),
    email: cli.findArgument('email'),
  });

  console.log('Finished.');
  process.exit();
})();
