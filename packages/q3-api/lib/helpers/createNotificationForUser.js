const Mailer = require('q3-core-mailer');
const session = require('q3-core-session');
const { isFunction } = require('lodash');
const { getWebAppUrlByUser } = require('./utils');

const createNotificationForUser =
  (templateName, makePayload) => async (user) => {
    const {
      email,
      firstName,
      id,
      lang = 'en',
      tenant = null,
    } = user;

    session.set('TENANT', tenant);
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
