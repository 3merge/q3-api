const mailer = require('q3-core-mailer');
const { i18n } = require('q3-core-responder');
const { Users } = require('../models');

const EVENT_NAME = 'onNewUser';

require('./emitter').on(
  EVENT_NAME,
  async ({ email, id, secret, lang }) => {
    const i18nClone = i18n.cloneInstance({
      lng: lang,
    });

    const systemListeners = await Users.isListeningFor(
      EVENT_NAME,
    );

    mailer()
      .to([email])
      .subject('newAccount')
      .props({
        body: i18nClone.t('messages:verification'),
        button: 'Verify now',
        url: `${process.env.WEB_APP}/verify`,
        rows: [
          {
            label: i18nClone.t('labels:id'),
            value: id,
          },
          {
            label: i18nClone.t('labels:verificationCode'),
            value: secret,
          },
        ],
      })
      .send();

    if (systemListeners.length)
      mailer()
        .to(systemListeners)
        .subject('newUser')
        .props({ body: 'newUserSetup' })
        .send();
  },
);
