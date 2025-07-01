#!/usr/bin/env node
/* eslint-disable no-console */
require('dotenv').config();

const path = require('path');
const Email = require('../lib/models/emails');
const data = require('./fixtures/emailTemplates.json');
const db = require('./helpers/db');
const files = require('./helpers/files');

(async () => {
  const directory = path.resolve(
    process.cwd(),
    'lib/chores',
  );

  console.log('Initializing chore directory...');
  files.ensureExistenceOf(directory);

  console.log('Connecting to database...');
  await db();

  console.log('Seeding email collection...');
  await Email.insertMany(data);

  console.log('Finished.');
  process.exit();
})();
