/* eslint-disable no-param-reassign, no-console */
const mongoose = require('mongoose');
const cluster = require('cluster');

module.exports = async (collection) => {
  if (!cluster.isMaster) return;

  const mod = mongoose.models[collection];
  console.log('Initializing');

  if (!mod) {
    console.log('Unknown collection');
    return;
  }

  try {
    await mod.createTextIndex();
    console.log('Created index');
  } catch (e) {
    console.log('Skipped index');
  }

  console.log('Seeding');
  await mod.initializeFuzzySearching({
    active: true,
  });

  console.log('Finished');
};
