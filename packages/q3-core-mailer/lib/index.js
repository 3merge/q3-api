require('dotenv').config();

const listener = require('./listener');
const Mailer = require('./core');

const chain = (templateName) => new Mailer(templateName);
chain.listen = listener;

module.exports = chain;
