const { MongoCron } = require('mongodb-cron');
const mongoose = require('../config/mongoose');

console.log(mongoose.collection);

/*
const collection = mongoose.collection('jobs');
const cron = new MongoCron({
  collection, // a collection where jobs are stored
  onDocument: async (doc) => console.log(doc), // triggered on job processing
  onError: async (err) => console.log(err), // triggered on error
});

cron.start();

*/
