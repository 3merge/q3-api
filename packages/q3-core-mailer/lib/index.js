require('dotenv').config();

const Scheduler = require('./scheduler');
const listener = require('./listener');
const Logger = require('./logger');
const Emitter = require('./emitter');
const Mailer = require('./core');
const walker = require('./walker');

const chain = (templateName) => new Mailer(templateName);

chain.config = Mailer.config;
chain.emit = Emitter.emit.bind(Emitter);
chain.get = Emitter.eventNames.bind(Emitter);
chain.on = Emitter.on.bind(Emitter);
chain.discover = walker;
chain.listen = listener;

// dbs
chain.Logger = Logger;
chain.Scheduler = Scheduler;

module.exports = chain;
