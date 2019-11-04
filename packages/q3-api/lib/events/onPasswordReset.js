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
    const url = `${process.env.WEB_APP}/login`;
    const body = i18nClone.t(
      'messages:resetPasswordEmail',
      {
        firstName,
        password,
        url,
      },
    );

    await mailer()
      .to([email])
      .subject(subject)
      .props({
        body,
      })
      .send();
  },
);
