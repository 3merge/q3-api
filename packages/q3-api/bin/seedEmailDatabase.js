#!/usr/bin/env node
/* eslint-disable no-console */
require('dotenv').config();

const fs = require('fs');
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

  const copyChoreDirectory = () =>
    fs.cpSync(
      path.resolve(__dirname, './chores'),
      directory,
      {
        recursive: true,
      },
    );

  console.log('Connecting to database...');
  await db();

  console.log('Seeding email collection...');
  await Email.insertMany(data);

  console.log('Initializing chore directory...');
  files.ensureExistenceOf(directory);

  console.log('Copying default chores...');
  copyChoreDirectory();

  console.log('Finished.');
  process.exit();
})();
