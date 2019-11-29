require('dotenv').config();
require('./templates');

const { readdirSync } = require('fs');
const EventEmitter = require('events');
const Handlebars = require('handlebars');
const path = require('path');
const loadTemplate = require('./templates');
const send = require('./strategies');

const emitter = new EventEmitter();
const e = 'smtp';

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
    this.src = Handlebars.compile(loadTemplate(template));
    this.data = settings;
    this.meta = settings;
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

  body(str) {
    Object.assign(this.data, {
      body: str,
    });

    return this;
  }

  async send() {
    const html = this.src(this.data);
    const output = await send(this.data.strategy, {
      ...this.meta,
      html,
    });

    emitter.emit(e, {
      ...output,
      html,
    });

    return output;
  }
}

// chainable singleton
const chain = (templateName) => new Mailer(templateName);

const walkDirectory = (dir, env) => {
  readdirSync(dir).forEach((dirent) => {
    const f = path.basename(dirent, path.extname(dirent));
    if (f.startsWith('on')) {
      // eslint-disable-next-line
      env.on(f, require(path.join(dir, dirent)));
    }
  });
};

chain.listen = (next) => emitter.on(e, next);
chain.discover = walkDirectory;

chain.config = (options) =>
  Object.assign(settings, options);

module.exports = chain;
