#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const files = require('./helpers/files');

const workingDirectory = process.cwd();
const folder = path.resolve(
  workingDirectory,
  './accessJson',
);

const createAdministratorFile = () => {
  const filePath = path.resolve(
    folder,
    'Administrator.json',
  );

  if (!fs.existsSync(filePath))
    files.writeJsonTo(
      filePath,
      // eslint-disable-next-line
      require('./fixtures/Administrator.json'),
    );
};

const getAccessRules = (file) => {
  const data = fs.readFileSync(
    path.resolve(folder, `./${file}`),
  );

  const parsedData = JSON.parse(data);
  const role = file.split('.')[0].split(/-/g).join(' ');

  return parsedData.map((item) => ({
    ...item,
    role,
  }));
};

console.log('Checking directory...');
files.ensureExistenceOf(folder);

console.log('Checking for administrator file...');
createAdministratorFile();

console.log('Reading role definitions...');
fs.readdir(folder, (err, data) => {
  if (err) console.error(err);

  console.log('Writing role definitions...');
  files.writeJsonTo(
    path.resolve(workingDirectory, './q3-access.json'),
    data.map(getAccessRules).flat(),
  );

  console.log('Finished.');
  process.exit();
});
