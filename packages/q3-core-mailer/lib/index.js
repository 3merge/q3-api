require('dotenv').config();

const Emitter = require('./emitter');
const Mailer = require('./core');
const utils = require('./utils');

const chain = (templateName) => new Mailer(templateName);

chain.config = Mailer.config;
chain.emit = Emitter.emit.bind(Emitter);
chain.get = Emitter.eventNames.bind(Emitter);
chain.on = Emitter.on.bind(Emitter);

chain.discover = utils.discoverEmailListenersInDir;

module.exports = chain;
