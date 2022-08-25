#!/usr/bin/env node
/* eslint-disable no-console,global-require */
require('dotenv').config();

const path = require('path');
const seedLocale = require('../lib/helpers/seedLocale');
const db = require('./helpers/db');
const cli = require('./helpers/cli');
const files = require('./helpers/files');

(async () => {
  const namespaces = [
    'labels',
    'descriptions',
    'helpers',
    'titles',
  ];

  const lang = cli.findArgument('lang', 'en');
  const folder = path.join(
    process.cwd(),
    `./lib/lang/${lang}`,
  );

  const getOption = (arg) =>
    Boolean(cli.findArgument(arg, false));

  const getPathFor = (name) =>
    path.resolve(folder, `./${name}.json`);

  const reduceLocaleFolder = () =>
    namespaces.reduce((acc, curr) => {
      // eslint-disable-next-line
      acc[curr] = require(getPathFor(curr));
      return acc;
    }, {});

  console.log('Checking for locale files...');
  files.ensureExistenceOf(folder);
  namespaces.forEach((namespace) =>
    files.checkExistenceOfAndWriteJsonTo(
      getPathFor(namespace),
      {},
    ),
  );

  console.log('Connecting to database...');
  await db();

  console.log('Seeding database...');
  await seedLocale(lang, reduceLocaleFolder(), {
    applyToAll: getOption('applyToAll'),
    overwrite: getOption('overwrite'),
  });

  console.log('Finished');
  process.exit();
})();
