const path = require('path');
const mjml = require('mjml');
const fs = require('fs');
const Handlebars = require('handlebars');
const i18next = require('i18next');
const { first, get, lowerCase } = require('lodash');
const utils = require('./utils');
const mailer = require('./strategies');
const {
  EmailCollection,
  MjmlTextParser,
} = require('./helpers');

// assumed to be registered already with mongoose
const DEFAULT_MODEL_NAME = 'emails';

module.exports = class Mailer {
  constructor(template, options = {}) {
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

    this.$model = get(options, 'model', DEFAULT_MODEL_NAME);
  }

  static async preview(raw, options = {}) {
    const { model = DEFAULT_MODEL_NAME, variables } =
      options;
    const db = EmailCollection(model);
    const parser = MjmlTextParser(raw);

    parser.replace(await db.getTemplates(parser.find()));
    return Handlebars.compile(mjml(parser.out()).html)(
      variables,
    );
  }

  async fromDatabase(variables = {}) {
    this.meta.html = await this.constructor.preview(
      await EmailCollection(this.$model).getMjml(
        get(this, 'meta.template'),
      ),
      {
        model: this.$model,
        variables,
      },
    );

    return this;
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
