const { discover } = require('q3-core-mailer');
const ev = require('./emitter');

discover(__dirname, ev);
module.exports = ev;
