const mailer = require('q3-core-mailer');
const i18Base = require('../config/i18next');
const { Users } = require('../models');

const EVENT_NAME = 'onNewUser';

require('./emitter').on(
  EVENT_NAME,
  async ({ email, id, secret, lang }) => {
    const i18n = i18Base.cloneInstance({
      lng: lang,
    });

    const systemListeners = await Users.isListeningFor(
      EVENT_NAME,
    );

    mailer()
      .to([email])
      .subject('newAccount')
      .props({
        body: i18n.t('messages:verification'),
        button: 'Verify now',
        url: `${process.env.WEB_APP}/verify`,
        rows: [
          {
            label: i18n.t('labels:id'),
            value: id,
          },
          {
            label: i18n.t('labels:verificationCode'),
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
