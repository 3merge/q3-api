require('dotenv').config();

const Mailer = require('./core');
const utils = require('./utils');

const chain = (templateName) => new Mailer(templateName);

chain.config = Mailer.config;
chain.emit = Mailer.emit;
chain.get = Mailer.get;

chain.discover = utils.discoverEmailListenersInDir;

module.exports = chain;
