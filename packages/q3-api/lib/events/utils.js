const mailer = require('q3-core-mailer');
const path = require('path');
const { i18n } = require('q3-core-responder');
const { Users } = require('../models');

const send = async (args = {}) => {
  const { email, lang, pathname, key } = args;
  const i18nClone = i18n.cloneInstance({
    lng: lang,
  });

  const url = `${process.env.WEB_APP}/${pathname}`;
  const subject = i18nClone.t(`messages:${key}`);
  const body = i18nClone.t(`emails:${key}`, {
    ...args,
    url,
  });

  await mailer()
    .to([email])
    .subject(subject)
    .body(body)
    .send();
};

const report = async (e, args) => {
  const systemListeners = await Users.isListeningFor(e);
  const i18nClone = i18n.cloneInstance();
  const subject = i18nClone.t(`messages:${e}`);
  const body = i18nClone.t(`emails:${e}`, args);

  if (systemListeners.length)
    mailer()
      .to(systemListeners)
      .subject(subject)
      .body(body)
      .send();
};

const eventName = (fn) =>
  path.basename(fn, path.extname(fn));

module.exports = {
  send,
  report,
  eventName,
};
