import i18next from 'i18next';
import en from '../../locale/en.json';
import fr from '../../locale/fr.json';

i18next.init({
  lng: 'en',
  fallbackLng: 'en',
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en,
    fr,
  },
});

export default i18next;
