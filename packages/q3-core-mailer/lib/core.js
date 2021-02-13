const mailgun = require('q3-adapter-mailgun');
const utils = require('./utils');

const mailer = async (strategy, data = {}) => {
  const services = {
    Mailgun: mailgun(),
  };

  if (!(strategy in services))
    throw new Error('Unknown strategy');

  return services[strategy].send(data);
};

module.exports = class Mailer {
  constructor(template) {
    if (!template)
      throw new Error('Template name required');

    const {
      MAILER_FROM = '3merge <donotreply@3merge.ca>',
      MAILER_STRATEGY = 'Mailgun',
    } = process.env;

    this.meta = {
      from: MAILER_FROM,
      strategy: MAILER_STRATEGY,
      template,
    };
  }

  to(addresses, cc = false, bcc = false) {
    let key = 'to';
    if (cc) key = 'cc';
    if (bcc) key = 'bcc';

    if (!Array.isArray(addresses))
      throw new Error('Must provide an array');

    this.meta[key] = utils.filterByEmailValidity(addresses);
    return this;
  }

  subject(subject) {
    this.meta.subject = subject;
    return this;
  }

  props(args = {}) {
    Object.assign(this.meta.variables, args);
    return this;
  }

  async send() {
    const { strategy, ...emailProps } = this.meta;
    return mailer(strategy, emailProps);
  }
};
