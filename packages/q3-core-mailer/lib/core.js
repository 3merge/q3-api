const path = require('path');
const mjml = require('mjml');
const fs = require('fs');
const Handlebars = require('handlebars');
const i18next = require('i18next');
const { first, lowerCase } = require('lodash');
const utils = require('./utils');
const mailer = require('./strategies');

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

  get lang() {
    const str = String(this.meta.template);
    return str.includes('-')
      ? lowerCase(first(str.split('-')))
      : 'en';
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

  subjecti18n(subject, vars = {}) {
    this.meta.subject = i18next.getFixedT(this.lang)(
      ['subjects', subject].join(':'),
      vars,
    );

    return this;
  }

  mjml(vars = {}) {
    const dir = process.cwd();
    const { template } = this.meta;
    const mj = fs.readFileSync(
      path.resolve(dir, `templates/${template}.mjml`),
      'utf8',
    );

    this.meta.html = Handlebars.compile(mjml(mj).html)(
      vars,
    );

    return this;
  }

  props(args = {}) {
    /**
     * @NOTE
     * This needs to be implemented on the strategy level.
     * Too specific to mailgun.
     */
    Object.assign(this.meta, {
      'h:X-Mailgun-Variables': JSON.stringify(args),
    });

    return this;
  }

  async send() {
    const { strategy, ...emailProps } = this.meta;

    if (emailProps.html && emailProps.template)
      delete emailProps.template;

    return mailer(strategy, emailProps);
  }
};
