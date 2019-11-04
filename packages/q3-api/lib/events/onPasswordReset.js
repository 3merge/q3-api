const mailer = require('q3-core-mailer');
const { i18n } = require('q3-core-responder');

const EVENT_NAME = 'onPasswordReset';

require('./emitter').on(
  EVENT_NAME,
  async ({ email, password, firstName, lang }) => {
    const i18nClone = i18n.cloneInstance({
      lng: lang,
    });

    const subject = i18nClone.t('messages:passwordReset');
    const body = i18nClone.t('messages:temporaryPassword');
    const button = i18nClone.t('labels:login');
    const title = i18nClone.t('messages:greetings', {
      firstName,
    });

    const rows = [
      {
        label: i18nClone.t('labels:temporaryPassword'),
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
