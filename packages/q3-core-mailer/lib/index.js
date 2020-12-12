require('dotenv').config();

const Scheduler = require('q3-core-scheduler');
const listener = require('./listener');
const Logger = require('./logger');
const Emitter = require('./emitter');
const Mailer = require('./core');
const walker = require('./walker');

const chain = (templateName) => new Mailer(templateName);

chain.config = Mailer.config;
chain.emit = Scheduler.queue;
chain.get = Emitter.eventNames.bind(Emitter);
chain.on = Emitter.on.bind(Emitter);
chain.discover = walker;
chain.listen = listener;

// dbs
chain.Logger = Logger;

module.exports = chain;
