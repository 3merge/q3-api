// const { MongoCron } = require('mongodb-cron');
// const { emit } = require('q3-core-mailer');
const { Schema, model } = require('../config/mongoose');

const Jobs = model(
  'Jobs',
  new Schema(
    {
      autoRemove: Boolean,
      sleepUntil: Date,
      interval: String,
    },
    {
      restify: 'get delete',
      collectionNameSingular: 'job',
      collectionNamePlural: 'jobs',
      strict: false,
    },
  ),
);
/*
const cron = new MongoCron({
  collection: Jobs.collection,
  onDocument: async (doc) => {
    emit('onJobsInsert', doc);
  },
  onError: async (err) => {
    emit('onJobsError', err);
  },
});


cron.start();
*/
// export single mongoose function
module.exports = (args) => Jobs.create(args);
