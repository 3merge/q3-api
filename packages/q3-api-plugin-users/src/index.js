import Q3, { i18 } from 'q3-api';
import Schema from './schema';
import routes from './routes';
import { MODEL_NAME, Events } from './constants';
import en from '../locale/en.json';
import fr from '../locale/fr.json';

const ns = 'validations';
i18.addResourceBundle('en', ns, en);
i18.addResourceBundle('fr', ns, fr);

const Q3UsersPlugin = (api, db) => {
  db.model(MODEL_NAME, Schema);
  api.use(routes);
};

export default Q3UsersPlugin;
export { Schema, Events };

export const seedSuperUser = async ({
  password,
  firstName,
  lastName,
  email,
}) => {
  const Model = Q3.model(MODEL_NAME);
  if (await Model.countDocuments({ email })) return;

  const doc = new Model({
    role: 'Super',
    firstName,
    lastName,
    email,
  });

  await doc.setSecret();
  await doc.setPassword(password);
};
