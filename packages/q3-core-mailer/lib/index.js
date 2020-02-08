require('dotenv').config();

const Mailer = require('./core');
const utils = require('./utils');

const chain = (templateName) => new Mailer(templateName);

chain.config = Mailer.config;
chain.discover = utils.discoverEmailListenersInDir;
chain.emit = Mailer.emit;

module.exports = chain;
