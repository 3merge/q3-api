const Emitter = require('./emitter');
const mailer = require('./strategies');
const utils = require('./utils');

const settings = {
  from: '3merge <donotreply@3merge.ca>',
  strategy: 'Mailgun',
};

module.exports = class Mailer {
  constructor(template) {
    if (!template)
      throw new Error('Template name required');

    this.meta = { ...settings, template };
  }

  static config(options = {}) {
    Object.assign(settings, options);
  }

  static emit(...params) {
    Emitter.emit(...params);
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
    Object.assign(this.meta, utils.prefix(args));
    return this;
  }

  async send() {
    const { strategy, ...emailProps } = this.meta;
    return mailer(strategy, emailProps);
  }
};
