#!/usr/bin/env node
/* eslint-disable no-console */
const { groupBy } = require('lodash');
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
          '_id': {
            userId: '$userId',
            tenant: '$tenant',
          },
          'docs': {
            '$addToSet': '$_id',
          },
        },
      },
      {
        '$project': {
          '_id': 0,
          'userId': '$_id.userId',
          'tenant': '$_id.tenant',
          'count': {
            '$size': '$docs',
          },
        },
      },
    ],
  ]);

  const bulk =
    Counters.collection.initializeOrderedBulkOp();

  const enforceNull = (xs) =>
    !xs || xs === 'undefined' || xs === 'null' ? null : xs;

  console.log('Grouping into tenants...');
  Object.entries(
    groupBy(
      seed.map((item) => ({
        ...item,
        tenant: enforceNull(item.tenant),
      })),
      'tenant',
    ),
  ).forEach(([t, items]) =>
    items.forEach((item) => {
      const tenant = enforceNull(t);

      bulk
        .find({ userId: item.userId, tenant })
        .upsert()
        .update({
          $set: {
            notifications: item.count,
            tenant,
          },
        });
    }),
  );

  await bulk.execute();
  console.log('Done');
})();
