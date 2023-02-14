#!/usr/bin/env node
/* eslint-disable no-console,global-require */
require('dotenv').config();
require('../lib/models/domainsResources');

const path = require('path');
const db = require('./helpers/db');
const Domain = require('../lib/models/domains');

require('./helpers/onMaster')(async () => {
  console.log('Connecting to database...');
  await db();

  console.log('Seeding listen optinos...');
  // eslint-disable-next-line
  const listens = require(path.resolve(
    process.cwd(),
    'q3-listens.json',
  ));

  const res = await Domain.updateMany(
    {},
    {
      $set: {
        listens,
      },
    },
    {
      strict: false,
    },
  );

  console.log('Finished: ', res);
  process.exit();
});
