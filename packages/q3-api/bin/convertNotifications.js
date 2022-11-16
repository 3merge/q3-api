#!/usr/bin/env node
/* eslint-disable no-console */
const db = require('./helpers/db');
const {
  Counters,
  Notifications,
} = require('../lib/models');

(async () => {
  console.log('Connecting to DB...');
  await db();

  console.log('Updating notifications...');
  await Notifications.updateMany(
    { active: { $ne: false } },
    {
      $rename: { 'hasRead': 'read' },
      $set: {
        active: true,
        archived: false,
      },
    },
  );

  console.log('Gathering user stats...');
  const seed = await Notifications.aggregate([
    [
      {
        '$match': {
          'read': {
            '$ne': true,
          },
          'archived': {
            '$ne': true,
          },
        },
      },
      {
        '$group': {
          '_id': '$userId',
          'docs': {
            '$addToSet': '$_id',
          },
        },
      },
      {
        '$project': {
          '_id': 0,
          'userId': '$_id',
          'count': {
            '$size': '$docs',
          },
        },
      },
    ],
  ]);

  const bulk =
    Counters.collection.initializeOrderedBulkOp();

  seed.forEach((item) =>
    bulk
      .find({ userId: item.userId })
      .upsert()
      .update({
        $set: {
          notifications: item.count,
        },
      }),
  );

  await bulk.execute();
  console.log('Done');
})();
