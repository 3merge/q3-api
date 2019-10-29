const mailer = require('q3-core-mailer');
const { Users } = require('../models');

const EVENT_NAME = 'onNewUser';

require('./emitter').on(
  EVENT_NAME,
  async ({ email, id, secret }) => {
    const systemListeners = await Users.isListeningFor(
      EVENT_NAME,
    );

    mailer()
      .to(['mibberson@3merge.ca'])
      .subject('newAccount')
      .props({ body: 'verificationInstructions' })
      .send();

    if (systemListeners.length)
      mailer()
        .to(systemListeners)
        .subject('newUser')
        .props({ body: 'newUserSetup' })
        .send();
  },
);
