const i18next = require('i18next');
const FsBackend = require('i18next-node-fs-backend');
const path = require('path');

const locales = path.join(
  __dirname,
  '../../locales/{{lng}}/{{ns}}.json',
);

i18next.use(FsBackend).init({
  lng: 'en',
  fallbackLng: 'en',
  preload: ['en', 'fr'],
  ns: ['messages', 'errors', 'validations', 'labels'],
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
  saveMissing: true,
  backend: {
    loadPath: locales,
    addPath: locales,
  },
});

const loadTranslation = (lang, ns, json) =>
  i18next.addResources(lang, ns, json);

module.exports = {
  loadTranslation,
  $inst: i18next,
};
