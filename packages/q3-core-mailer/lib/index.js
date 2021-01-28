require('dotenv').config();

const listener = require('./listener');
const Logger = require('./logger');
const Emitter = require('./emitter');
const Mailer = require('./core');

const chain = (templateName) => new Mailer(templateName);

chain.get = Emitter.eventNames.bind(Emitter);
chain.on = Emitter.on.bind(Emitter);
chain.listen = listener;

// dbs
chain.Logger = Logger;
module.exports = chain;
