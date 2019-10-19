require('dotenv').config();
require('./templates');

const Handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');
const send = require('./strategies');

const settings = {
  website: 'https://3merge.ca',
  logo: 'https://3merge.ca',
  from: '3merge <donotreply@3merge.ca>',
  year: new Date().getFullYear(),
  companyName: '3merge Inc',
  color: 'rgb(30, 20, 52)',
  address: '700 Finley Ave Unit 5, Ajax, ON L1S 3Z2',
  strategy: 'mailgun',
};

class Mailer {
  constructor(template = 'transactional') {
    const tmp = path.resolve(
      __dirname,
      `./templates/${template}.html`,
    );

    fs.statSync(tmp);

    this.data = settings;
    this.meta = settings;
    this.src = Handlebars.compile(
      `${fs.readFileSync(tmp)}`,
    );
  }

  to(addresses) {
    if (!Array.isArray(addresses))
      throw new Error('Must provide an array');

    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const defaultMailTo = process.env.MAILGUN_DEV_RECIPIENT;

    addresses.forEach((a) => {
      if (!re.test(String(a).toLowerCase()))
        throw new Error(`${a} is invalid`);
    });

    this.meta.to = re.test(defaultMailTo)
      ? defaultMailTo
      : addresses.join(', ');

    return this;
  }

  subject(subject) {
    this.meta.subject = subject;
    return this;
  }

  props(args) {
    const re = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    if (args.url && !re.test(args.url))
      throw new Error(`${args.url} is invalid URL`);

    Object.assign(this.data, args);
    return this;
  }

  async send() {
    return send(this.data.strategy, {
      ...this.meta,
      html: this.src(this.data),
    });
  }
}

// chainable singleton
const chain = (templateName) => new Mailer(templateName);
chain.config = (options) =>
  Object.assign(settings, options);

module.exports = chain;
