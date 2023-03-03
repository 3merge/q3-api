const Mailer = require('q3-core-mailer');
const session = require('q3-core-session');
const { isFunction } = require('lodash');
const {
  getWebAppUrlByUser,
  normalizeLangCode,
} = require('./utils');

const createNotificationForUser =
  (templateName, makePayload) => async (user) => {
    const {
      email,
      firstName,
      id,

      tenant = null,
    } = user;

    session.set('TENANT', tenant);
    const lang = normalizeLangCode(user.lang);
    const m = Mailer(`${lang}-${templateName}`).to([email]);

    await m.fromDatabase({
      id,
      firstName,
      tenant,
      url: getWebAppUrlByUser(user),
      ...(isFunction(makePayload) ? makePayload(user) : {}),
    });

    return m.send();
  };

module.exports = createNotificationForUser;
