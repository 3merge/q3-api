const mailer = require('q3-core-mailer');
const i18Base = require('../config/i18next');

const EVENT_NAME = 'onPasswordReset';

require('./emitter').on(
  EVENT_NAME,
  async ({ email, password, firstName, lang }) => {
    const i18n = i18Base.cloneInstance({
      lng: lang,
    });

    const subject = i18n.t('messages:passwordReset');
    const body = i18n.t('messages:temporaryPassword');
    const button = i18n.t('labels:login');
    const title = i18n.t('messages:greetings', {
      firstName,
    });

    const rows = [
      {
        label: i18n.t('labels:temporaryPassword'),
        value: `"${password}"`,
      },
    ];

    await mailer()
      .to([email])
      .subject(subject)
      .props({
        url: `${process.env.WEB_APP}/login`,
        title,
        body,
        button,
        rows,
      })
      .send();
  },
);
