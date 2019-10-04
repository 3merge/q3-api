const Q3 = require('q3-api');
const Schema = require('./schema');
const routes = require('./routes');
const { MODEL_NAME } = require('./constants');
const messagesEN = require('../locale/en/messages.json');
const validationsEN = require('../locale/en/validations.json');
const messagesFR = require('../locale/fr/messages.json');
const validationsFR = require('../locale/fr/validations.json');

Q3.loadTranslation('en', 'messages', messagesEN);
Q3.loadTranslation('fr', 'messages', messagesFR);
Q3.loadTranslation('en', 'validations', validationsEN);
Q3.loadTranslation('fr', 'validations', validationsFR);

const Q3UsersPlugin = (api, db) => {
  db.model(MODEL_NAME, Schema);
  api.use(routes);
};

Q3UsersPlugin.$Schema = Schema;

Q3UsersPlugin.createSuperUser = async ({
  firstName,
  lastName,
  email,
}) => {
  const Model = Q3.model(MODEL_NAME);
  if (await Model.countDocuments({ email })) return null;

  const doc = new Model({
    role: 'Super',
    firstName,
    lastName,
    email,
  });

  await doc.setSecret();
  return doc.setPassword();
};

module.exports = Q3UsersPlugin;
