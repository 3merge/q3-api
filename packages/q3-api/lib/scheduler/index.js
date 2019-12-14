const { MongoCron } = require('mongodb-cron');
const { Schema, model } = require('../config/mongoose');
const Emitter = require('../events/emitter');

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

const cron = new MongoCron({
  collection: Jobs.collection,
  onDocument: async (doc) => {
    Emitter.emit('onJobsInsert', doc);
  },
  onError: async (err) => {
    Emitter.emit('onJobsError', err);
  },
});

cron.start();

// export single mongoose function
module.exports = (args) => Jobs.create(args);
