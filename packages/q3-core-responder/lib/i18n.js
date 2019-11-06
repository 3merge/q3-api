const i18next = require('i18next');

i18next.init({
  lng: 'en',
  fallbackLng: 'en',
  preload: ['en', 'fr'],
  ns: ['messages', 'errors', 'validations', 'labels'],
  keySeparator: false,
  saveMissing: true,
  interpolation: {
    escapeValue: false,
  },
});

module.exports = i18next;
