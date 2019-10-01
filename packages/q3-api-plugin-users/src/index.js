import Q3 from 'q3-api';
import Schema from './schema';
import routes from './routes';
import { MODEL_NAME, Events } from './constants';
import messagesEN from '../locale/en/messages.json';
import validationsEN from '../locale/en/validations.json';
import messagesFR from '../locale/fr/messages.json';
import validationsFR from '../locale/fr/validations.json';

Q3.loadTranslation('en', 'messages', messagesEN);
Q3.loadTranslation('fr', 'messages', messagesFR);
Q3.loadTranslation('en', 'validations', validationsEN);
Q3.loadTranslation('fr', 'validations', validationsFR);

const Q3UsersPlugin = (api, db) => {
  db.model(MODEL_NAME, Schema);
  api.use(routes);
};

export default Q3UsersPlugin;
export { Schema, Events };

export const seedSuperUser = async ({
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
