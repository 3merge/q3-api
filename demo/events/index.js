const { config, discover } = require('q3-core-mailer');

const from = 'support@3merge.ca';
const strategy = 'Mailgun';

config({ from, strategy });
discover(__dirname);
