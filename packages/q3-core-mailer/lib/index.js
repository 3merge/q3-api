require('dotenv').config();

const listener = require('./listener');
const Logger = require('./logger');
const Emitter = require('./emitter');
const Mailer = require('./core');
const MailerFacade = require('./facade');
const {
  getWebAppUrlAsTenantUser,
  langCode,
} = require('./utils');

const chain = (templateName) => new Mailer(templateName);

chain.get = Emitter.eventNames.bind(Emitter);
chain.on = Emitter.on.bind(Emitter);
chain.listen = listener;

chain.Logger = Logger;
chain.Facade = MailerFacade;

chain.utils = {
  getWebAppUrlAsTenantUser,
  langCode,
};

module.exports = chain;
